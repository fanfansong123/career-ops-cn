// 通用 JD 捕获 Bookmarklet
// 适用于各大公司 careers 页面（字节/阿里/腾讯/美团/小红书/DeepSeek 等）
// 也适用于拉勾、电鸭、v2ex 等常见招聘页面

(async function () {
  // 解除反复制
  document.querySelectorAll('*').forEach((el) => {
    try {
      el.style.userSelect = 'auto';
      el.style.webkitUserSelect = 'auto';
      if (el.oncopy) el.oncopy = null;
      if (el.oncontextmenu) el.oncontextmenu = null;
    } catch {}
  });

  const pickText = (selectors) => {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const txt = (el.innerText || el.textContent || '').trim();
        if (txt.length > 0) return txt;
      }
    }
    return '';
  };

  const bodyText = document.body?.innerText || '';

  // 大厂常用 selector（按命中率排序）
  const JOB_TITLE_SELS = [
    '[class*="position-title"]', '[class*="job-title"]', '[class*="positionName"]',
    '.position-detail h1', '.job-detail h1', 'h1.title', 'h1',
  ];
  const COMPANY_SELS = [
    '[class*="company-name"]', '[class*="brand-name"]', '[class*="companyName"]',
  ];
  const SALARY_SELS = [
    '[class*="salary"]', '.salary', '[class*="compensation"]',
  ];
  const LOCATION_SELS = [
    '[class*="position-location"]', '[class*="job-location"]',
    '[class*="city"]', '[class*="location"]',
  ];

  // 找到最大的非导航文本块作为 JD 正文
  let descText = pickText([
    '[class*="job-detail"]', '[class*="position-detail"]',
    '[class*="recruit-content"]', '[class*="position-description"]',
    '[class*="job-description"]', '[class*="position-content"]',
    '.detail-content', '.content-detail', 'main', 'article',
  ]);

  if (descText.length < 200) {
    let best = null, bestLen = 0;
    document.querySelectorAll('div, section, article, main').forEach((el) => {
      const cls = (el.className || '').toString().toLowerCase();
      if (/nav|footer|header|sidebar|menu|modal|toast/.test(cls)) return;
      const len = (el.innerText || '').trim().length;
      if (len > bestLen && len > 200 && len < 30000) {
        best = el;
        bestLen = len;
      }
    });
    if (best) descText = best.innerText.trim();
  }

  // hostname → 公司名映射
  const HOST_MAP = {
    'jobs.bytedance.com': '字节跳动', 'talent.alibaba.com': '阿里巴巴',
    'careers.tencent.com': '腾讯', 'zhaopin.meituan.com': '美团',
    'zhaopin.kuaishou.cn': '快手', 'job.xiaohongshu.com': '小红书',
    'jobs.bilibili.com': 'B站', 'hr.163.com': '网易',
    'join.jd.com': '京东', 'careers.pinduoduo.com': '拼多多',
    'talent.baidu.com': '百度', 'talent.didiglobal.com': '滴滴',
    'www.deepseek.com': 'DeepSeek', 'www.moonshot.cn': 'Moonshot',
    'www.zhipuai.cn': '智谱AI', 'www.minimaxi.com': 'MiniMax',
    'www.pingcap.com': 'PingCAP', 'www.starrocks.io': 'StarRocks',
    'www.lagou.com': '拉勾', 'eleduck.com': '电鸭',
    'global.v2ex.co': 'V2EX', 'www.v2ex.com': 'V2EX',
    'www.proginn.com': '程序员客栈',
  };

  const platform = (() => {
    const host = location.hostname;
    for (const [k, v] of Object.entries(HOST_MAP)) {
      if (host.includes(k)) return v;
    }
    return 'other';
  })();

  const extracted = {
    job_title: pickText(JOB_TITLE_SELS),
    company: pickText(COMPANY_SELS) || HOST_MAP[location.hostname] || '',
    salary: pickText(SALARY_SELS),
    location: pickText(LOCATION_SELS),
    description: descText,
  };

  const payload = {
    url: location.href,
    page_title: document.title,
    captured_at: new Date().toISOString(),
    platform,
    extracted: { ...extracted, raw_text: bodyText },
  };

  try {
    const res = await fetch('http://localhost:8787/jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (result.ok) {
      alert(
        '✅ JD 已保存！\n→ ' + result.file +
        '\n\n公司：' + (extracted.company || '?') +
        '\n岗位：' + (extracted.job_title || '?') +
        '\n\n回到终端运行 /career-ops pipeline'
      );
    } else {
      alert('❌ 保存失败: ' + (result.error || 'unknown'));
    }
  } catch {
    alert('❌ 无法连接到本地服务器\n\n请先运行: node tools/jd-inbox-server.mjs');
  }
})();
