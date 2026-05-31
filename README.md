# Career-Ops-CN

[![GitHub stars](https://img.shields.io/github/stars/fanfansong123/career-ops-cn?style=flat)](https://github.com/fanfansong123/career-ops-cn/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Based on](https://img.shields.io/badge/based%20on-career--ops%2046k%20⭐-purple.svg)](https://github.com/santifer/career-ops)

> AI 求职指挥中心 — 基于 Claude Code，适配国内招聘环境。

[career-ops](https://github.com/santifer/career-ops) (46k+ stars, MIT) 的中国本地化版本。粘贴一份 JD，自动完成岗位评分、简历定制和面试准备。

## 为什么需要 career-ops-cn？

原版 career-ops 为硅谷/英文招聘设计，国内求职至少有 **5 个水土不服**：

| 痛点 | 原版 | career-ops-cn |
|------|------|------|
| 招聘平台 | Greenhouse/Ashby/Lever API | **BOSS直聘/猎聘/拉勾 — Bookmarklet 一键捕获 JD** |
| 薪资数据 | Glassdoor/Levels.fyi | 脉脉/offershow/牛客 |
| 简历格式 | 英文字体 Space Grotesk | **阿里巴巴普惠体 2.0，A4 纸** |
| 面试准备 | 仅 STAR+R | **STAR+R + 八股文 + 算法刷题 + HR面 + 群面 + JD差距分析** |
| 福利评估 | Cultural signals | **五险一金/公积金比例/年终奖/试用期/期权** |

## 核心亮点

### 🔗 Bookmarklet 一键捕获 JD（独家）

国内招聘平台（BOSS直聘/猎聘）有登录墙+滑块验证码，Playwright/CDP 全被拦。**Bookmarklet** 方案在你已登录的浏览器里运行 JS，直接读取 DOM 提取 JD，完全绕开反爬。

```
浏览器打开 BOSS直聘 → 登录 → 看岗位 → 点书签栏 → 5字段自动提取 → 本地保存
```

**提取字段：公司 / 岗位 / 薪资 / 地点 / 经验要求 / JD 正文**

### 🎯 智能评分（A-G 七维度）

不比纯文本匹配，会调用 WebSearch 查公司信息、薪资数据、岗位真实性：

| 维度 | 评估内容 |
|------|------|
| 简历匹配 | 技能+经验+项目对齐 JD 的程度 |
| 北极星对齐 | 远程/兼职/全职 匹配你的目标画像 |
| 薪资福利 | 月薪/年薪月数/五险一金基数/公积金比例/年终奖/试用期 |
| 发展空间 | 团队规模/技术栈/晋升/业务前景 |
| 红线 | 996/竞业/外包/试用期过长 |
| 真实性（Block G） | 是否真实在招岗位（BOSS活跃度/急聘标签等） |

### 📄 中文 PDF 简历（ATS 优化）

- JD 关键词注入（改写真实经历，不编造）
- 阿里普惠体 2.0，A4 纸
- 单栏布局，标准标题，确保机器可解析
- JD 适配后自动调整叙事框架

### 📚 面试准备（含学习路线）

不仅给你八股文清单，还会对比 JD 发现你的 **能力缺口**，生成具体学习路线（P0/P1/P2 分级、学习资源、预计时间、最低可接受水平、面试话术）。

### 🤖 批量评估

Bookmarklet 逐个捕获 JD → `--batch` 一键生成批量评估提示词 → 粘贴给 Claude → 统一评分 → `--mark-all` 标记完成。比原版 batch（依赖 Playwright + claude -p 子进程）更适合国内。

## 功能一览（13/17 已测试）

| 命令 | 功能 | 状态 |
|------|------|------|
| `/career-ops {JD}` | 粘贴 JD → 评分+PDF+追踪 全流程 | ✅ |
| `/career-ops oferta` | A-G 七维度岗位评分 | ✅ |
| `/career-ops ofertas` | 多岗位 9 维度加权对比 | ✅ |
| `/career-ops pdf` | JD 定制中文 PDF 简历 | ✅ |
| `/career-ops interview-prep` | 面试全准备 + 差距分析 + 学习路线 | ✅ |
| `/career-ops contacto` | 脉脉/BOSS直聘/LinkedIn 外联消息 | ✅ |
| `/career-ops deep` | 6 维度深度公司研究 | ✅ |
| `/career-ops tracker` | 投递追踪看板 | ✅ |
| `/career-ops scan` | 多平台岗位扫描 | ✅ |
| `/career-ops training` | 培训/证书价值评估 | ✅ |
| `/career-ops project` | 作品集项目方向评估 | ✅ |
| `/career-ops update` | 系统文件更新 | ✅ |
| **Bookmarklet** | BOSS直聘/猎聘 JD 一键捕获 | ✅ |
| Go TUI 仪表盘 | 终端投递看板 | ✅ |
| `/career-ops patterns` | 被拒规律分析 | ⚠️ |
| `/career-ops followup` | 跟进提醒 | ⚠️ |
| `/career-ops batch` | 批量处理（原版模式） | ⚠️ |

## 快速开始

```bash
# 1. 克隆
git clone https://github.com/fanfansong123/career-ops-cn.git
cd career-ops-cn && npm install

# 2. 配置
cp config/profile.example.yml config/profile.yml  # 填入个人信息
cp templates/portals.example.yml portals.yml       # 目标公司（可选）

# 3. 创建简历（项目根目录）
touch cv.md  # Markdown 格式，内容见下方说明

# 4. 检查环境
npm run doctor

# 5. 启动 Claude Code
claude
```

### cv.md 格式示例

```markdown
## 个人信息
- 姓名：张三
- 电话：138xxxx
- 邮箱：zhangsan@example.com
- GitHub：github.com/zhangsan
- 学历：本科 | 计算机科学与技术 | 2013

## 工作经历
### UCloud (2017.05-2023.10)
- 岗位：高级后端开发工程师
- 工作内容：...
```

## Bookmarklet JD 捕获

### 安装（一次配置）

```bash
# 1. 启动本地入箱服务器
node tools/jd-inbox-server.mjs

# 2. 浏览器打开 http://localhost:8787

# 3. 显示书签栏（Chrome: Cmd+Shift+B）

# 4. 把页面上的按钮拖到书签栏
```

### 使用（日常）

```
打开 BOSS直聘/猎聘 职位详情页（需已登录）
    → 点书签栏按钮
    → 弹窗提示 "✅ JD 已保存"
    → JD 自动存入 jds/ 目录
```

### 评估

```bash
# 查看攒了多少
node tools/process-jds.mjs

# 单条评估: 直接粘贴 JD 内容给我

# 批量评估: 攒多条后一次性评估
node tools/process-jds.mjs --batch   # 生成批量提示词
# 粘贴输出给我 → 统一评分
node tools/process-jds.mjs --mark-all  # 标记已处理
```

## 与原版对比

| | 原版 | career-ops-cn |
|---|---|---|
| 评分体系 | 6维度含 Cultural signals | 五险一金/公积金/年终奖/试用期/期权 |
| 薪资来源 | Glassdoor / Levels.fyi | 脉脉 / offershow / 牛客 |
| 简历 | 英文，Space Grotesk | 中文，阿里普惠体 2.0，A4 |
| 招聘平台 | Greenhouse/Ashby/Lever | **BOSS直聘/猎聘/拉勾 + Bookmarklet** |
| 面试 | STAR+R | **+ 八股文 + 算法 + HR面 + 群面 + 差距分析** |
| 外联 | LinkedIn | 脉脉 / BOSS直聘 / LinkedIn / 微信 |
| 公司库 | 45+ 海外 | 35+ 国内（含字节/阿里/DeepSeek/智谱等） |
| JD 捕获 | Playwright API 抓取 | **Bookmarklet 浏览器内 DOM 提取** |
| 批量处理 | claude -p 子进程 | Bookmarklet + --batch 统一评估 |
| 仪表盘 | Go TUI | Go TUI（原版自带，已编译可用） |

## 技术栈

- **Node.js** — 脚本、JD Inbox Server、PDF 生成
- **Claude Code** — AI 驱动评估/简历生成/面试准备
- **Go + Bubble Tea** — 终端 TUI 仪表盘
- **Playwright** — 辅助页面渲染

## 已知限制

- BOSS直聘/猎聘 DOM 结构可能变化，Bookmarklet 需偶尔维护
- `patterns`（被拒分析）/ `followup`（跟进提醒）需较多投递数据才有价值
- Go TUI 仪表盘未中文化（菜单/标题仍为英文）

## 协议

MIT，基于 [santifer/career-ops](https://github.com/santifer/career-ops)

## 贡献

欢迎 Issue/PR：
- 更多招聘平台 Bookmarklet 适配
- 模式文件的 bug 修复和体验优化
- 仪表盘中文化
