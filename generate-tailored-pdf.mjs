/**
 * 根据 JD 生成定制化 PDF 简历
 *
 * 用法:
 *   node generate-tailored-pdf.mjs --jd "JD文本或文件路径" --output "output/xxx.pdf"
 *   node generate-tailored-pdf.mjs --keywords "Go,微服务,K8s,分布式" --output "output/xxx.pdf"
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { parseArgs } from 'util';

const { values: args } = parseArgs({
  options: {
    jd: { type: 'string' },
    keywords: { type: 'string' },
    output: { type: 'string' },
    company: { type: 'string' },
    role: { type: 'string' },
    format: { type: 'string', default: 'a4' },
  }
});

// ============================================================
// Step 1: 读取源数据
// ============================================================
function loadSourceData() {
  const cv = readFileSync('cv.md', 'utf-8');
  const profileRaw = readFileSync('config/profile.yml', 'utf-8');

  // 简单解析 YAML（只取需要的字段）
  const name = (profileRaw.match(/full_name:\s*"([^"]+)"/) || [null, ''])[1];
  const email = (profileRaw.match(/email:\s*"([^"]+)"/) || [null, ''])[1];
  const phone = (profileRaw.match(/phone:\s*"([^"]+)"/) || [null, ''])[1];
  const wechat = (profileRaw.match(/wechat:\s*"([^"]+)"/) || [null, ''])[1];
  const location = (profileRaw.match(/city:\s*"([^"]+)"/) || [null, ''])[1];
  const github = (profileRaw.match(/github:\s*"([^"]+)"/) || [null, ''])[1];

  return { cv, name, email, phone, wechat, location, github };
}

// ============================================================
// Step 2: 从 JD 提取关键词
// ============================================================
function extractKeywords(jdText) {
  if (!jdText) return [];
  const text = jdText.toLowerCase();
  const keywords = [];

  const techMap = [
    'Go', 'Golang', 'Gin', 'GORM', 'gRPC', 'GraphQL', 'Kafka', 'RabbitMQ',
    'Redis', 'MySQL', 'PostgreSQL', 'MongoDB', 'ElasticSearch',
    'Docker', 'Kubernetes', 'K8s', 'Docker Compose', 'Helm',
    'React', 'Vue', 'TypeScript', 'JavaScript',
    'Python', 'Java', 'C++', 'Rust', 'Node.js',
    '微服务', '分布式', '高并发', 'DDD', '幂等', '分布式锁',
    'RAG', 'Agent', 'LangChain', 'LLM', '大模型', 'AI',
    'Nacos', 'Sentinel', 'Dubbo',
    'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Prometheus', 'Grafana', 'Jaeger',
    'Camunda', '工作流', '流程编排',
    '多租户', '权限管理', 'SaaS',
  ];

  for (const kw of techMap) {
    if (text.includes(kw.toLowerCase())) {
      keywords.push(kw);
    }
  }
  return [...new Set(keywords)].slice(0, 15);
}

// ============================================================
// Step 3: 填充模板占位符
// ============================================================
function fillTemplate(data, jdKeywords, company, role) {
  let template = readFileSync('templates/cv-template.html', 'utf-8');

  const { name, email, phone, wechat, location, github, cv } = data;

  // 基础占位符
  template = template.replace(/{{LANG}}/g, 'zh-CN');
  template = template.replace(/{{PAGE_WIDTH}}/g, '210mm');
  template = template.replace(/{{NAME}}/g, name);
  template = template.replace(/{{PHONE}}/g, phone);
  template = template.replace(/{{EMAIL}}/g, email);
  template = template.replace(/{{LOCATION}}/g, location);

  // 微信行
  const wechatRow = wechat
    ? `\n      <span class="separator">|</span>\n      <span>微信: ${wechat}</span>`
    : '';
  template = template.replace(/{{WECHAT_ROW}}/g, wechatRow);

  // GitHub / Blog
  template = template.replace(/{{GITHUB_URL}}/g, github ? `https://${github}` : '#');
  template = template.replace(/{{GITHUB_DISPLAY}}/g, github || '');
  template = template.replace(/{{BLOG_URL}}/g, '#');
  template = template.replace(/{{BLOG_DISPLAY}}/g, '');

  // 段落标题
  template = template.replace(/{{SECTION_SUMMARY}}/g, '职业概述');
  template = template.replace(/{{SECTION_COMPETENCIES}}/g, '核心能力');
  template = template.replace(/{{SECTION_EXPERIENCE}}/g, '工作经历');
  template = template.replace(/{{SECTION_PROJECTS}}/g, '项目经历');
  template = template.replace(/{{SECTION_EDUCATION}}/g, '教育背景');
  template = template.replace(/{{SECTION_CERTIFICATIONS}}/g, '证书');
  template = template.replace(/{{SECTION_SKILLS}}/g, '技能');

  // 职业概述（从 cv.md 提取并注入 JD 关键词）
  const summary = generateSummary(cv, jdKeywords, company);
  template = template.replace(/{{SUMMARY_TEXT}}/g, summary);

  // 核心能力
  const competencies = generateCompetencies(cv, jdKeywords);
  template = template.replace(/{{COMPETENCIES}}/g, competencies);

  // 工作经历（从 cv.md 提取）
  const experience = generateExperience(cv);
  template = template.replace(/{{EXPERIENCE}}/g, experience);

  // 项目经历
  const projects = generateProjects(cv);
  template = template.replace(/{{PROJECTS}}/g, projects);

  // 教育背景
  const education = generateEducation(cv);
  template = template.replace(/{{EDUCATION}}/g, education);

  // 证书
  template = template.replace(/{{CERTIFICATIONS}}/g, '');

  // 技能
  const skills = generateSkills(cv, jdKeywords);
  template = template.replace(/{{SKILLS}}/g, skills);

  return template;
}

function generateSummary(cv, keywords, company) {
  // 从 cv.md 提取职业概述段
  const match = cv.match(/## 职业概述\s*\n+([\s\S]*?)(?=\n##|\n\*\*)/);
  let summary = match ? match[1].trim() : '';

  // 如果有 JD 关键词，补充一句
  if (keywords.length > 0 && company) {
    const top3 = keywords.slice(0, 3).join('、');
    summary += ` 正积极向 AI 应用开发与 ${top3} 方向拓展。`;
  }

  return summary;
}

function generateCompetencies(cv, keywords) {
  const tags = [];
  // 从技能和 JD 关键词生成
  const defaultTags = [
    'Go / Golang', '微服务架构', 'Kubernetes / Docker', 'Kafka 消息系统',
    '分布式系统设计', 'MySQL / PostgreSQL', 'Redis', 'gRPC', '流程编排',
    'Gin / GORM', 'Jaeger 链路追踪', '私有化部署交付'
  ];

  for (const tag of defaultTags) {
    // 如果 JD 有关键词匹配，优先放前面
    const matched = keywords.some(kw => tag.toLowerCase().includes(kw.toLowerCase()));
    if (matched) {
      tags.unshift(`<span class="competency-tag">${tag}</span>`);
    } else {
      tags.push(`<span class="competency-tag">${tag}</span>`);
    }
  }

  return tags.join('\n      ');
}

function generateExperience(cv) {
  // 工作经历：简短版 — 公司、岗位、时间、一句话概括
  const jobs = extractBriefWorkExperience(cv);
  let html = '';
  for (const job of jobs) {
    html += `    <div class="job">
      <div class="job-header">
        <span class="job-company">${job.company}</span>
        <span class="job-period">${job.period}</span>
      </div>
      <div class="job-role">${job.role}</div>
      <div class="job-desc" style="font-size:10px;color:#555;margin-top:3px;">${job.summary}</div>
    </div>\n`;
  }
  return html;
}

function extractBriefWorkExperience(cv) {
  const jobs = [];
  const companyBlocks = cv.split(/(?=### [^\n]+--)/);

  for (const block of companyBlocks) {
    const nameMatch = block.match(/###\s+(.+?)\s+--/);
    if (!nameMatch) continue;
    const company = nameMatch[1].trim();

    const roleMatch = block.match(/\*\*(.+?)\*\*\s*\|\s*(.+)/);
    const role = roleMatch ? roleMatch[1].trim() : '';
    const period = roleMatch ? roleMatch[2].trim() : '';

    // 提取第一句概括（紧接着角色那行的下一行非空文本）
    const lines = block.split('\n');
    let summary = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(role) && lines[i].includes(period)) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const line = lines[j].trim();
          if (line && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
            summary = line;
            break;
          }
        }
        break;
      }
    }

    if (company && role && period) {
      jobs.push({ company, role, period, summary });
    }
  }
  return jobs;
}

function generateProjects(cv) {
  const projectsSection = cv.match(/## 项目经历([\s\S]*?)(?=## 教育|$)/);
  if (!projectsSection) return '<p>暂无</p>';

  const text = projectsSection[1];
  let html = '';
  // 按 "### " 开头分割项目
  const projectBlocks = text.split(/\n(?=### )/);

  for (const block of projectBlocks) {
    if (!block.trim()) continue;
    const titleMatch = block.match(/###\s+(.+)/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();

    // 提取技术栈行: **日期 | 技术栈**
    const techLineMatch = block.match(/\*\*(.+?)\*\*/);
    let techLine = techLineMatch ? techLineMatch[1].trim() : '';

    // 提取角色
    const roleMatch = block.match(/\*\*角色：?\*\*\s*(.+)/);
    const role = roleMatch ? roleMatch[1].trim() : '';

    // 提取背景
    const bgMatch = block.match(/\*\*背景：?\*\*\s*(.+)/);
    const background = bgMatch ? bgMatch[1].trim() : '';

    // 提取我的工作
    let workContent = '';
    const workSection = block.match(/\*\*我的工作：?\*\*\s*([\s\S]*?)(?=\*\*产出|\*\*服务|\*\*其他|---|$)/);
    if (workSection) {
      const points = workSection[1].matchAll(/^[-*]\s+(.+)$/gm);
      const pointList = [];
      for (const p of points) pointList.push(p[1].trim());
      workContent = pointList.join('<br>');
    }

    // 提取产出
    const outputMatch = block.match(/\*\*产出：?\*\*\s*(.+)/);
    const output = outputMatch ? outputMatch[1].trim() : '';

    // 提取服务客户
    const clientMatch = block.match(/\*\*服务客户：?\*\*\s*(.+)/);
    const clients = clientMatch ? clientMatch[1].trim() : '';

    // 提取其他模块
    const otherMatch = block.match(/\*\*其他参与模块：?\*\*\s*(.+)/);
    const others = otherMatch ? otherMatch[1].trim() : '';

    html += `    <div class="project">
      <span class="project-title">${title}</span>
      <div class="project-tech">${techLine}</div>`;

    if (role) {
      html += `\n      <div class="project-meta"><strong>角色：</strong>${role}</div>`;
    }
    if (background) {
      html += `\n      <div class="project-meta"><strong>背景：</strong>${background}</div>`;
    }
    if (workContent) {
      html += `\n      <div class="project-desc"><strong>我的工作：</strong><br>${workContent}</div>`;
    }
    if (output) {
      html += `\n      <div class="project-meta"><strong>产出：</strong>${output}</div>`;
    }
    if (clients) {
      html += `\n      <div class="project-meta"><strong>服务客户：</strong>${clients}</div>`;
    }
    if (others) {
      html += `\n      <div class="project-meta"><strong>其他：</strong>${others}</div>`;
    }

    html += `\n    </div>\n`;
  }

  return html;
}

function generateEducation(cv) {
  const eduMatch = cv.match(/[-*]\s+(.+大学.+)\s*[（(](.+)[）)]/);
  if (!eduMatch) return '<p>见简历</p>';

  return `    <div class="edu-item">
      <div class="edu-header">
        <span class="edu-title">本科 · ${eduMatch[2]}</span>
        <span class="edu-org">${eduMatch[1]}</span>
        <span class="edu-year">2009 - 2013</span>
      </div>
    </div>`;
}

function generateSkills(cv, keywords) {
  const skillsSection = cv.match(/## 技能([\s\S]*?)$/);
  if (!skillsSection) return '';

  const text = skillsSection[1];
  let html = '<div class="skills-grid">\n';

  const skillLines = text.matchAll(/[-*]\s+\*\*(.+?):\*\*\s*(.+)/g);
  for (const m of skillLines) {
    html += `      <span class="skill-item"><span class="skill-category">${m[1]}:</span> ${m[2]}</span>\n`;
  }

  html += '    </div>';
  return html;
}

// ============================================================
// Step 4: 主流程
// ============================================================
async function main() {
  console.error('📋 生成定制化 PDF 简历...\n');

  const data = loadSourceData();
  console.error(`  ✅ 读取 cv.md + profile.yml`);

  // JD 关键词
  let jdKeywords = [];
  if (args.keywords) {
    jdKeywords = args.keywords.split(',').map(k => k.trim());
  } else if (args.jd) {
    const jdText = readFileSync(args.jd, 'utf-8');
    jdKeywords = extractKeywords(jdText);
  }
  if (jdKeywords.length > 0) {
    console.error(`  ✅ 提取 JD 关键词: ${jdKeywords.join(', ')}`);
  } else {
    console.error(`  ⚠️  未提供 JD 关键词，生成通用简历`);
  }

  // 生成 HTML
  const company = args.company || 'target';
  const role = args.role || 'backend';
  const html = fillTemplate(data, jdKeywords, company, role);

  const tmpHtml = `/tmp/cv-${data.name.replace(/\s/g, '-')}-${company}.html`;
  writeFileSync(tmpHtml, html, 'utf-8');
  console.error(`  ✅ 生成 HTML: ${tmpHtml}`);

  // 生成 PDF
  const output = args.output || `output/cv-${data.name.replace(/\s/g, '-')}-${company}.pdf`;
  const format = args.format || 'a4';

  console.error(`  ✅ 生成 PDF...`);
  execSync(`node generate-pdf.mjs "${tmpHtml}" "${output}" --format=${format}`, {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  console.error(`\n📁 PDF 已保存: ${output}`);
}

main().catch(e => {
  console.error(`❌ 错误: ${e.message}`);
  process.exit(1);
});
