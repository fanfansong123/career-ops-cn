// 猎聘（liepin.com）JD 捕获 Bookmarklet
// 用法：打开猎聘职位详情页（需已登录）→ 点击书签栏 → JD 自动保存

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
  ['copy', 'cut', 'contextmenu', 'selectstart'].forEach((evt) => {
    document.addEventListener(evt, (e) => e.stopPropagation(), true);
  });

  const bodyText = document.body?.innerText || '';

  // 检测登录墙
  if (/请\s*登录|登录后查看|立即登录|登录\s*并\s*查看/.test(bodyText) && bodyText.length < 1500) {
    alert('⚠️ 猎聘需要登录后才能看完整 JD\n\n请先登录猎聘账号，刷新页面后再点一次。');
    return;
  }

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

  const extracted = {
    job_title: pickText([
      '.title-info h1', '.job-title-wrap h1',
      '[class*="job-title-name"]', '[class*="title-info"] h1', 'h1',
    ]),
    company: pickText([
      '.company-info-container .name', '[class*="company-name"]',
      '.company-name a', '[class*="company-info"] .name',
    ]),
    salary: pickText(['.job-item-title .salary', '[class*="salary"]', '.salary']),
    location: pickText([
      '.basic-infor span:first-child', '[class*="job-place"]',
      '[class*="location"]',
    ]),
    description: pickText([
      '.job-intro-content', '.job-describe-content', '.content.content-word',
      '[class*="job-describe"]', '[class*="job-intro"]', '[class*="job-detail"]',
    ]),
    requirements: pickText(['.job-item-list', '[class*="tag-list"]', '[class*="labels"]']),
  };

  const payload = {
    url: location.href,
    page_title: document.title,
    captured_at: new Date().toISOString(),
    platform: 'liepin',
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
        '✅ 猎聘 JD 已保存！\n→ ' + result.file +
        '\n\n岗位：' + (extracted.job_title || '?') +
        '\n公司：' + (extracted.company || '?') +
        '\n\n回到终端运行 /career-ops pipeline'
      );
    } else {
      alert('❌ 保存失败: ' + (result.error || 'unknown'));
    }
  } catch {
    alert('❌ 无法连接到本地服务器\n\n请先运行: node tools/jd-inbox-server.mjs');
  }
})();
