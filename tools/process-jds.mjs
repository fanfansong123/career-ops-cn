#!/usr/bin/env node
// process-jds.mjs — 处理 jds/ 中通过 Bookmarklet 捕获的 JD
// 支持单条查看、批量评估、标记已处理
//
// 用法:
//   node tools/process-jds.mjs              # 列出待处理 JD
//   node tools/process-jds.mjs --id=xxx     # 输出指定 JD 的完整文本
//   node tools/process-jds.mjs --all        # 输出所有待处理 JD 完整文本
//   node tools/process-jds.mjs --batch      # 生成批量评估提示词（一次性评估所有）
//   node tools/process-jds.mjs --mark=xxx   # 标记指定 JD 为已处理
//   node tools/process-jds.mjs --mark-all   # 标记所有待处理 JD 为已处理

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const JDS_DIR = path.join(ROOT, 'jds');
const PROCESSED_FILE = path.join(JDS_DIR, '.processed.json');

const args = process.argv.slice(2);
const getId = () => args.find(a => a.startsWith('--id='))?.split('=')[1];
const getAll = () => args.includes('--all');
const getMark = () => args.find(a => a.startsWith('--mark='))?.split('=')[1];
const isBatch = () => args.includes('--batch');
const isMarkAll = () => args.includes('--mark-all');

// 读取已处理列表
function getProcessed() {
  if (!fs.existsSync(PROCESSED_FILE)) return new Set();
  try { return new Set(JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'))); }
  catch { return new Set(); }
}

function saveProcessed(set) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...set], null, 2));
}

// 列出所有 JD 文件
function listJDFiles() {
  if (!fs.existsSync(JDS_DIR)) return [];
  return fs.readdirSync(JDS_DIR)
    .filter(f => f.startsWith('jd-') && f.endsWith('.json'))
    .sort();
}

// 读取 JD 文件
function readJD(filename) {
  const filepath = path.join(JDS_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

// 格式化 JD 为可读文本
function formatJD(jd) {
  const e = jd.extracted || {};
  let out = '';
  out += `**链接:** ${jd.url}\n`;
  out += `**平台:** ${jd.platform}\n`;
  out += `**捕获时间:** ${jd.captured_at}\n\n`;
  if (e.job_title) out += `## ${e.job_title}\n\n`;
  if (e.company) out += `**公司:** ${e.company}\n`;
  if (e.salary) out += `**薪资:** ${e.salary}\n`;
  if (e.location) out += `**地点:** ${e.location}\n`;
  if (e.experience) out += `**经验要求:** ${e.experience}\n`;

  // JD 正文
  const desc = e.description || '';
  if (desc) {
    // 清理多余空白
    const cleaned = desc.replace(/\n{3,}/g, '\n\n').trim();
    out += `\n---\n\n${cleaned}\n`;
  }

  // fallback: 如果 description 为空，尝试从 raw_text 提取
  if (!desc && e.raw_text) {
    const raw = e.raw_text;
    const jdMatch = raw.match(/(?:职位描述|岗位职责|工作内容|工作职责)[\s\S]*?(?=公司介绍|公司基本信息|工商信息|BOSS安全提示|工作地址|$)/);
    if (jdMatch) {
      out += `\n---\n\n${jdMatch[0].trim()}\n`;
    }
  }

  return out;
}

// ---- main ----
const processed = getProcessed();
const files = listJDFiles();
const unprocessed = files.filter(f => !processed.has(f));

// --mark=xxx
if (getMark()) {
  const target = getMark();
  if (files.includes(target) || unprocessed.includes(target)) {
    processed.add(target);
    saveProcessed(processed);
    console.log(`✅ 已标记为处理: ${target}`);
  } else {
    console.log(`❌ 文件不存在: ${target}`);
  }
  process.exit(0);
}

// --id=xxx
if (getId()) {
  const target = getId();
  const jd = readJD(target);
  if (!jd) { console.log(`❌ 文件不存在或格式错误: ${target}`); process.exit(1); }
  console.log(formatJD(jd));
  process.exit(0);
}

// --all
if (getAll()) {
  if (unprocessed.length === 0) {
    console.log('✅ 没有待处理的 JD。');
    process.exit(0);
  }
  for (const f of unprocessed) {
    const jd = readJD(f);
    if (!jd) continue;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 ${f}`);
    console.log('='.repeat(60));
    console.log(formatJD(jd));
  }
  process.exit(0);
}

// --batch: 生成批量评估提示词（一次性粘贴给 Claude）
if (isBatch()) {
  if (unprocessed.length === 0) {
    console.log('✅ 没有待处理的 JD。');
    process.exit(0);
  }

  const jds = unprocessed.map(f => readJD(f)).filter(Boolean);

  console.log(`请对以下 ${jds.length} 个岗位进行批量评估。每个岗位输出 A-G 完整评分 + 建议。\n`);
  console.log('='.repeat(60));
  console.log(`总共 ${jds.length} 个岗位待评估\n`);

  for (let i = 0; i < jds.length; i++) {
    const jd = jds[i];
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`📌 岗位 ${i + 1}/${jds.length}`);
    console.log('─'.repeat(50));
    console.log(formatJD(jd));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📋 评估完成后，运行: node tools/process-jds.mjs --mark-all');

  process.exit(0);
}

// --mark-all: 标记所有未处理 JD 为已处理
if (isMarkAll()) {
  if (unprocessed.length === 0) {
    console.log('✅ 没有待处理的 JD。');
    process.exit(0);
  }
  for (const f of unprocessed) {
    processed.add(f);
    console.log(`✅ ${f}`);
  }
  saveProcessed(processed);
  console.log(`\n已标记 ${unprocessed.length} 个 JD 为已处理`);
  process.exit(0);
}

// 默认：列表模式
console.log(`📬 JD Inbox — ${unprocessed.length} 个待处理\n`);

if (unprocessed.length === 0) {
  console.log('✅ 没有待处理的 JD。');
  console.log(`\n已处理: ${processed.size} 个`);
  process.exit(0);
}

for (const f of unprocessed) {
  const jd = readJD(f);
  if (!jd) continue;
  const e = jd.extracted || {};
  const title = e.job_title || e.company || jd.page_title || '?';
  const salary = e.salary || '-';
  const company = e.company || '-';
  console.log(`  [${f}]`);
  console.log(`    公司: ${company}`);
  console.log(`    岗位: ${title}`);
  console.log(`    薪资: ${salary}`);
}

console.log(`\n已处理: ${processed.size} 个`);
console.log(`\n命令:`);
console.log(`  node tools/process-jds.mjs --id=<文件>   查看完整 JD`);
console.log(`  node tools/process-jds.mjs --all          批量输出所有待处理 JD`);
console.log(`  node tools/process-jds.mjs --mark=<文件>  标记为已处理`);
