// BOSS直聘 JD 捕获 Bookmarklet v3
// 用法：打开 BOSS直聘 职位详情页（需已登录）→ 点击书签栏 → JD 自动保存到本地
// 数据保存在浏览器页面内，通过 fetch 发送到本地 localhost:8787

(async function () {
  // 解除反复制
  document.querySelectorAll('*').forEach((el) => {
    try {
      el.style.userSelect = 'auto';
      el.style.webkitUserSelect = 'auto';
      if (el.oncopy) el.oncopy = null;
    } catch {}
  });

  const bodyText = document.body?.innerText || '';
  const fullText = bodyText;
  const lines = bodyText.split('\n').map(l => l.trim()).filter(Boolean);

  // 检测登录墙/安全验证
  if (/安全验证|请完成安全验证|请滑动|请点击重试/i.test(bodyText) && bodyText.length < 500) {
    alert('⚠️ BOSS直聘触发了安全验证\n\n请先在浏览器里手动通过滑块验证，刷新页面后再点一次。');
    return;
  }
  if (/请登录|登录后查看|立即登录|扫码登录/i.test(bodyText)) {
    alert('⚠️ 需要登录 BOSS直聘\n\n请先在浏览器里登录，刷新页面后再点一次。');
    return;
  }

  // ---- 从页面标题提取职位名和公司名 ----
  // 格式: 「岗位名招聘」_公司名招聘-BOSS直聘  或  岗位名_公司名-BOSS直聘
  const title = document.title || '';
  let titleJob = '', titleCompany = '';
  const m1 = title.match(/^「(.+?)招聘」[_\s]*(.+?)招聘-BOSS直聘/);
  const m2 = title.match(/^(.+?)[_\s]+(.+?)招聘-BOSS直聘/);
  const m = m1 || m2;
  if (m) { titleJob = m[1].trim(); titleCompany = m[2].trim(); }

  // ---- 提取公司名 ----
  // 策略: 找 "公司基本信息" 区块，公司名紧接其后
  let companyFromBody = '';
  const ciIdx = lines.findIndex(l => l === '公司基本信息');
  if (ciIdx > -1) {
    for (let i = ciIdx + 1; i < Math.min(lines.length, ciIdx + 6); i++) {
      const line = lines[i];
      if (!line || !/[一-鿿]/.test(line)) continue;
      if (line.length < 4 || line.length > 40) continue;
      if (/^(已上市|未融资|A轮|B轮|天使|不需要|查看|工商|注册|法定|经营|成立)/.test(line)) continue;
      if (/^(北京|上海|深圳|广州|杭州|成都|武汉|南京|西安|苏州)$/.test(line)) continue;
      if (line === '...') continue;
      companyFromBody = line;
      break;
    }
  }
  // 兜底1: 从页面标题提取
  if (!companyFromBody && titleCompany) companyFromBody = titleCompany;
  // 兜底2: 正则匹配 "公司名称" 后面的行
  if (!companyFromBody) {
    const cm = fullText.match(/公司名称[\s\n]+(.{2,30}?)[\s\n]/);
    if (cm) companyFromBody = cm[1].trim();
  }

  // ---- 提取薪资 ----
  let salaryFromBody = '';
  const salMatch = fullText.match(/(\d{1,3}[-~]\d{1,3}[kK]·\d{1,2}薪)/);
  if (salMatch) salaryFromBody = salMatch[1];

  // ---- 提取地点和经验 ----
  // BOSS直聘 header 格式: "上海 10年以上 本科"
  let locationFromBody = '', expFromBody = '';
  const cities = '北京|上海|深圳|广州|杭州|成都|武汉|南京|西安|厦门|苏州|长沙|重庆|天津';
  const metaLine = lines.find(l => {
    const re = new RegExp(`^(${cities})\\s+(\\d{1,2}年(?:以内|以外|以上|以下)|经验不限|应届|在校)\\s+(本科|硕士|博士|大专|学历不限)`);
    return re.test(l);
  });
  if (metaLine) {
    const parts = metaLine.split(/\s+/);
    if (parts.length >= 2) {
      locationFromBody = parts[0];
      expFromBody = parts[1];
    }
  }

  // ---- 提取 JD 正文 ----
  let descText = '';
  // 从 "职位描述" 或 "岗位职责" 开始，到 "公司介绍" 或 "公司基本信息" 结束
  const jdStart = fullText.search(/(?:职位描述|岗位职责|工作内容|工作职责)/);
  if (jdStart > -1) {
    descText = fullText.slice(jdStart);
    const cutAt = descText.search(/公司介绍|公司基本信息|工商信息|BOSS安全提示|工作地址|竞争力分析|看过该职位|精选职位|微信扫码/);
    if (cutAt > 50) descText = descText.slice(0, cutAt).trim();
    descText = descText.replace(/\n{3,}/g, '\n\n').trim();
  }

  // ---- 组装结果 ----
  const extracted = {
    job_title: titleJob,
    company: companyFromBody,
    salary: salaryFromBody,
    location: locationFromBody,
    experience: expFromBody,
    description: descText,
  };

  const payload = {
    url: location.href,
    page_title: title,
    captured_at: new Date().toISOString(),
    platform: 'boss-zhipin',
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
        '\n薪资：' + (extracted.salary || '?') +
        '\n地点：' + (extracted.location || '?') +
        '\n\n回到终端粘贴给我跑评分'
      );
    } else {
      alert('❌ 保存失败: ' + (result.error || 'unknown'));
    }
  } catch {
    alert('❌ 无法连接到本地服务器\n\n请先运行: node tools/jd-inbox-server.mjs');
  }
})();
