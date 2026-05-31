#!/usr/bin/env node
// JD Inbox Server — 接收浏览器 Bookmarklet 发来的 JD 数据
// 保存到 jds/ 目录，供 /career-ops pipeline 处理
// 同时提供静态文件服务（安装页面 + Bookmarklet JS）
//
// 用法:
//   node tools/jd-inbox-server.mjs [--port 8787]

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const PORT = Number(process.argv.find(a => a.startsWith('--port='))?.split('=')[1]) || 8787;
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const INBOX = path.join(ROOT, 'jds');
const TOOLS_DIR = path.dirname(url.fileURLToPath(import.meta.url));

if (!fs.existsSync(INBOX)) fs.mkdirSync(INBOX, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt':  'text/plain; charset=utf-8',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// ---- static file helpers ----
function serveFile(res, filepath) {
  if (!fs.existsSync(filepath)) {
    res.writeHead(404, CORS);
    return res.end('not found');
  }
  const ext = path.extname(filepath);
  const mime = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filepath);
  res.writeHead(200, { ...CORS, 'Content-Type': mime });
  res.end(content);
}

// ---- helpers ----
function slugify(s, max = 40) {
  if (!s) return 'unknown';
  return s.replace(/[\/\\<>:"|?*\x00-\x1f]/g, '').replace(/\s+/g, '-').slice(0, max).trim() || 'unknown';
}

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// ---- routes ----
const ROUTES = {
  GET: {
    '/health': () => ({ code: 200, body: 'ok', type: 'text/plain' }),
    '/': () => serveFile,  // special: serve install.html
  },
};

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // ========== GET ==========
  if (req.method === 'GET') {
    const reqPath = req.url.split('?')[0];

    // / → install.html
    if (reqPath === '/') {
      return serveFile(res, path.join(TOOLS_DIR, 'install.html'));
    }

    // /health
    if (reqPath === '/health') {
      res.writeHead(200, { ...CORS, 'Content-Type': 'text/plain' });
      return res.end('ok');
    }

    // /bookmarklet/:name.js
    if (reqPath.startsWith('/bookmarklet/')) {
      const name = path.basename(reqPath);
      const safeName = name.replace(/[^a-zA-Z0-9_.-]/g, '');
      if (safeName !== name) {
        res.writeHead(403, CORS);
        return res.end('forbidden');
      }
      return serveFile(res, path.join(TOOLS_DIR, 'bookmarklets', safeName));
    }

    res.writeHead(404, CORS);
    return res.end('not found');
  }

  // ========== POST /jd ==========
  if (req.method === 'POST' && req.url === '/jd') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; if (body.length > 5_000_000) req.destroy(); });
    req.on('end', () => {
      let payload;
      try {
        payload = JSON.parse(body);
      } catch {
        res.writeHead(400, { ...CORS, 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'invalid json' }));
      }

      const platform = payload.platform || 'unknown';
      const titleHint = payload.extracted?.job_title || payload.extracted?.company || payload.page_title || 'unknown';
      const filename = `jd-${timestamp()}-${platform}-${slugify(titleHint)}.json`;
      const filepath = path.join(INBOX, filename);

      fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), 'utf8');

      console.log(`[${new Date().toISOString()}] ✅ saved ${filename}`);
      console.log(`  platform: ${platform}`);
      console.log(`  url: ${payload.url}`);
      console.log(`  title: ${titleHint}`);

      res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, file: `jds/${filename}` }));
    });
    return;
  }

  res.writeHead(404, CORS);
  res.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🔗 JD Inbox Server → http://localhost:${PORT}`);
  console.log(`   GET  /                   → 安装页面`);
  console.log(`   GET  /bookmarklet/*.js   → Bookmarklet 脚本`);
  console.log(`   POST /jd                 → 保存 JD 到 jds/`);
  console.log(`\n📖 浏览器打开 http://localhost:${PORT} 安装 Bookmarklet`);
});
