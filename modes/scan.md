# Mode: scan -- 招聘平台扫描器（岗位发现）

扫描招聘平台，发现新岗位并自动评估。

## 半自动扫描模式（国内平台专用）

由于 BOSS直聘/猎聘/拉勾等平台需要登录且无反爬 API，采用半自动流程：

### Step 1 — WebSearch 搜岗位

根据用户指定的条件执行搜索：

```
搜索关键词："{role} {remote/远程} {city}"
来源平台：BOSS直聘 / 猎聘 / 拉勾
```

**搜索策略：**
- BOSS直聘：`site:zhipin.com "{role}" "{城市}"`
- 猎聘：`site:liepin.com "{role}" "{城市}"`
- 拉勾：`site:lagou.com "{role}"`
- 全平台：不加 site 限制，靠搜索引擎自然覆盖

**从搜索结果提取：**
- 岗位名称、公司名、薪资范围（如果在摘要中可见）
- 链接 URL
- 来源平台

### Step 2 — 尝试自动获取 JD

对每个搜索结果，按以下顺序尝试获取完整 JD：

**a) WebFetch** — 尝试直接抓取页面
- 如果能拿到完整 JD 文本 → 跳到 Step 3 自动评分
- 如果抓到的内容被截断或需要登录 → 进入 Step 2b

**b) Playwright 快照** — 尝试无头浏览器快照
- `browser_navigate` + `browser_snapshot`
- 如果成功 → 跳到 Step 3
- 如果遇到登录/验证码 → 进入 Step 2c

**c) 用户手动补 JD** — 展示岗位列表，请用户手动粘贴
- 列出搜索到的岗位：公司名、岗位名、链接
- 用户选择感兴趣的，打开浏览器复制 JD 文本
- 粘贴给我 → 跳到 Step 3

### Step 3 — 自动评分

JD 到手后，立即执行 auto-pipeline：
- A-G 完整评估
- 生成 PDF 简历（如评分 ≥ 3.0）
- 追加到追踪表

### Step 4 — 输出批量评估报告

```markdown
## 扫描评估报告 — {YYYY-MM-DD}

| # | 公司 | 岗位 | 评分 | 远程 | 建议 |
|---|------|------|------|------|------|
| 1 | XX科技 | Go后端(远程) | 4.2/5 | ✅ | 立即投 |
| 2 | YY公司 | 高级后端 | 3.8/5 | ❌ | 可选 |
| 3 | ZZ平台 | Golang兼职 | 4.5/5 | ✅ | 立即投 |
```

### 用户可指定的搜索条件

每次扫描前询问用户（或使用默认值）：

- **岗位关键词**：默认 `Golang 后端 远程`（从 profile.yml 的 primary 取）
- **城市**：默认不限制（远程岗位不限地点）
- **工作方式**：`远程` / `混合` / `现场` / 不限
- **兼职**：`兼职` / `Freelance` / 不限
- **平台**：默认全平台搜索
- **搜索结果数**：默认前 20 条

---

## 全自动扫描模式（公司官网/ATS）

对于已配置 `careers_url` 的公司，使用原有 4 层级策略：

### 层级 0 — 本地解析器

```yaml
- name: Example Company
  careers_url: https://example.com/careers
  scan_method: local_parser
  parser:
    command: node
    script: scripts/parsers/example-jobs.js
    format: jobs-json-v1
  enabled: true
```

### 层级 1 — Playwright 直接扫描
- 导航 careers_url → 提取所有岗位标题+URL

### 层级 2 — ATS APIs
- Greenhouse / Lever / Workday API

### 层级 3 — WebSearch 查询
- `site:` 过滤器跨平台搜索
