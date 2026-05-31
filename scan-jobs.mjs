/**
 * 远程 Go 岗位扫描器 v2
 * 策略：WebSearch 发现 + 尽量抓 JD + 输出给用户确认
 *
 * Usage:
 *   node scan-jobs.mjs                            # 全平台搜索
 *   node scan-jobs.mjs --keyword "Golang 远程"     # 自定义关键词
 *   node scan-jobs.mjs --keyword "Go 兼职"          # 兼职方向
 *   node scan-jobs.mjs --output md                 # 输出 Markdown
 */

import { writeFileSync } from 'fs';

// ============================================================
// 通过公开搜索发现岗位
// ============================================================

const SEARCH_QUERIES = [
  // V2EX 招聘节点（Google 索引）
  { query: 'v2ex.com/t/ Golang 招聘', source: 'V2EX' },
  { query: 'v2ex.com/t/ "Go" "远程" OR "兼职"', source: 'V2EX' },

  // 电鸭社区
  { query: 'eleduck.com/posts Golang', source: '电鸭' },
  { query: 'eleduck.com/posts Go 后端', source: '电鸭' },

  // 程序员客栈
  { query: 'proginn.com Go 远程', source: '程序员客栈' },
  { query: 'proginn.com Golang 外包', source: '程序员客栈' },

  // LinkedIn（国际远程）
  { query: 'linkedin.com "Golang" "remote" China', source: 'LinkedIn' },

  // Indeed
  { query: 'indeed.com "Golang" remote China', source: 'Indeed' },

  // 其他来源
  { query: 'Go后端 远程 招聘 2025', source: '综合' },
  { query: 'Golang remote jobs china', source: '综合' },
];

// ============================================================
// JD 提取（尝试获取完整 JD）
// ============================================================
async function tryFetchJD(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      }
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      // 清理 HTML → 纯文本
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&[a-z]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);
    }
  } catch (e) {
    // 单条失败不影响整体
  }
  return '';
}

// ============================================================
// 工具函数
// ============================================================
function extractSalary(text) {
  const patterns = [
    /(\d+[kK]\s*[-~—]\s*\d+[kK])/,
    /(\d{1,2}[kK千]?\s*[-~—]\s*\d{1,2}[kK千万]\s*(?:\/\s*月)?)/,
    /(¥\s*\d+[-~—]\d+[kK万]\s*(?:\/\s*月)?)/,
    /(\d+[-~—]\d+元\s*[\/\·]\s*(?:天|日|小时|时))/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function isGolangRole(title, jd) {
  const goRe = /\bgo\b|golang/i;
  const backendRe = /后端|服务端|backend|back-end/i;
  return goRe.test(title + ' ' + jd) || (backendRe.test(title + ' ' + jd) && goRe.test(jd));
}

function isRemote(jd) {
  return /远程|remote|居家|home.?office|remote.?first|分布式办公/i.test(jd);
}

function isPartTime(jd) {
  return /兼职|part.?time|freelance|contract|外包|按小时|按天/i.test(jd);
}

function extractCompany(jd, title) {
  const patterns = [
    /\[([^\]]+)\]/,
    /【([^】]+)】/,
    /(?:公司|团队名称)[：:]\s*([^\s，。,\.]{2,30})/,
  ];
  for (const p of patterns) {
    const m = jd.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function extractTechStack(jd) {
  const keywords = [
    'Go', 'Golang', 'Gin', 'GORM', 'gRPC', 'GraphQL', 'Kafka', 'RabbitMQ',
    'Redis', 'MySQL', 'PostgreSQL', 'MongoDB', 'ElasticSearch', 'ES',
    'Docker', 'Kubernetes', 'K8s', 'Docker Compose', 'Helm',
    'React', 'Vue', 'TypeScript', 'Angular', 'Next.js',
    'Python', 'Java', 'Rust', 'Node.js', 'PHP',
    '微服务', '分布式', '高并发', 'DDD', 'CQRS',
    'RAG', 'Agent', 'LangChain', 'LLM', '大模型', 'AI',
    'Nacos', 'Sentinel', 'Seata', 'Dubbo',
    'Jenkins', 'GitLab CI', 'GitHub Actions', 'ArgoCD',
    'Prometheus', 'Grafana', 'Jaeger', 'ELK',
  ];
  const stack = [];
  for (const kw of keywords) {
    if (jd.toLowerCase().includes(kw.toLowerCase())) {
      stack.push(kw);
    }
  }
  return [...new Set(stack)];
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const outputMd = args.includes('--output') && args[args.indexOf('--output') + 1] === 'md';

  // 自定义关键词
  let keyword = '';
  const kwIdx = args.indexOf('--keyword');
  if (kwIdx > -1 && args[kwIdx + 1]) {
    keyword = args[kwIdx + 1];
  }

  const queries = keyword
    ? [
        { query: `v2ex.com/t/ ${keyword}`, source: 'V2EX' },
        { query: `eleduck.com/posts ${keyword}`, source: '电鸭' },
        { query: `proginn.com ${keyword}`, source: '程序员客栈' },
        { query: `${keyword} 远程 招聘`, source: '综合' },
        { query: `${keyword} remote china`, source: '综合' },
      ]
    : SEARCH_QUERIES;

  console.error(`🔍 扫描远程 Go 岗位...\n`);

  // === Phase 1: 发现岗位 ===
  // 注意：这一步我们用 WebSearch 工具来完成，此脚本做本地缓存和解析
  // 实际使用时，由 Claude Code 执行 WebSearch，将结果传给此脚本

  // 输出搜索建议供 Claude Code 执行
  console.error('请执行以下 WebSearch 查询:\n');
  queries.forEach((q, i) => {
    console.error(`  ${i + 1}. [${q.source}] ${q.query}`);
  });

  // 同时尝试直接抓取已知可访问的页面
  console.error('\n--- 尝试直接抓取已知页面 ---\n');

  const knownPages = [
    { url: 'https://eleduck.com/categories/5', name: '电鸭-招聘' },
    { url: 'https://eleduck.com/categories/8', name: '电鸭-外包' },
  ];

  const results = [];
  for (const page of knownPages) {
    console.error(`  尝试 ${page.name}...`);
    const html = await tryFetchJD(page.url);
    if (html) {
      // 从 HTML 中提取帖子链接
      const postRe = /href="(\/posts\/[a-zA-Z0-9]+)"[^>]*>([^<]+)/gi;
      let m;
      while ((m = postRe.exec(html)) !== null) {
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (isGolangRole(title, '')) {
          const detailUrl = `https://eleduck.com${m[1]}`;
          const jd = await tryFetchJD(detailUrl);
          results.push({
            platform: '电鸭',
            title,
            url: detailUrl,
            company: extractCompany(jd, title),
            salary: extractSalary(jd),
            isRemote: isRemote(jd),
            isPartTime: isPartTime(jd),
            techStack: extractTechStack(jd),
            jd: jd.slice(0, 2000),
          });
          console.error(`    ✅ ${title}`);
        }
      }
    }
  }

  // === Phase 2: 去重 + 过滤 ===
  const seen = new Set();
  const filtered = results.filter(j => {
    if (seen.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });

  // === Phase 3: 输出 ===
  if (outputMd) {
    let md = `# Go 远程/兼职岗位扫描 — ${new Date().toISOString().slice(0, 10)}\n\n`;
    md += `> 使用 \`node scan-jobs.mjs --keyword "Golang 远程"\` 自定义搜索\n\n`;
    md += `| # | 平台 | 岗位 | 远程 | 兼职 | 薪资 |\n`;
    md += `|---|------|------|------|------|------|\n`;
    filtered.forEach((j, i) => {
      const title = j.title.length > 40 ? j.title.slice(0, 40) + '...' : j.title;
      md += `| ${i + 1} | ${j.platform} | [${title}](${j.url}) | ${j.isRemote ? '✅' : '❌'} | ${j.isPartTime ? '✅' : '❌'} | ${j.salary || '-'} |\n`;
    });

    if (filtered.length === 0) {
      md += `\n> ⚠️ 未在已知平台找到新岗位。请通过 WebSearch 补充搜索。\n`;
    }

    md += `\n---\n\n`;
    filtered.forEach((j, i) => {
      md += `### ${i + 1}. ${j.title}\n\n`;
      md += `- **平台:** ${j.platform}\n`;
      md += `- **链接:** ${j.url}\n`;
      md += `- **薪资:** ${j.salary || '未标注'}\n`;
      md += `- **远程:** ${j.isRemote ? '是' : '否'}\n`;
      md += `- **兼职:** ${j.isPartTime ? '是' : '否'}\n`;
      md += `- **技术栈:** ${j.techStack.join(', ') || '未检测'}\n`;
      if (j.company) md += `- **公司:** ${j.company}\n`;
      if (j.jd) {
        const snippet = j.jd.slice(0, 600).replace(/\n/g, ' ');
        md += `\n\`\`\`\n${snippet}...\n\`\`\`\n`;
      }
      md += `\n---\n\n`;
    });

    writeFileSync('data/scan-jobs-result.md', md);
    console.log(`\n✅ 已保存到 data/scan-jobs-result.md (${filtered.length} 个岗位)`);
  } else {
    console.log(JSON.stringify(filtered, null, 2));
  }
}

main().catch(e => console.error(`❌ ${e.message}`));
