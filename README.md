# Career-Ops-CN

[career-ops](https://github.com/santifer/career-ops) (46k+ stars, MIT) 的中国本地化版本，适配国内招聘场景。

基于 Claude Code 的 AI 求职指挥中心：粘贴一份 JD，自动完成岗位评分、简历定制和面试准备。

> ⚠️ **当前状态：v0.1.0，部分功能已测试，部分待验证。** 欢迎试用和反馈。

## 与原版的区别

| | 原版 career-ops | career-ops-cn |
|---|---|---|
| 评分维度 | 6维度含 Cultural signals | 五险一金/公积金/年终奖/试用期/期权 |
| 薪资数据源 | Glassdoor / Levels.fyi | 脉脉 / offershow / 牛客 |
| 简历模板 | 英文，Space Grotesk 字体 | 中文，阿里巴巴普惠体，A4 |
| 招聘平台 | Greenhouse / Ashby / Lever | BOSS直聘 / 猎聘 / 拉勾（半自动） |
| 面试准备 | STAR+R | STAR+R + 八股文 + 算法刷题 + HR面 |
| 外联 | LinkedIn | 脉脉 / BOSS直聘 / LinkedIn / 微信 |
| 公司库 | 45+ 海外公司 | 35+ 国内公司 |

## 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| /career-ops {JD} 评分 | ✅ 已测试 | A-G 七维度完整评估，含岗位真实性判断 |
| PDF 简历生成 | ✅ 已测试 | 根据 JD 定制，AI 改写内容，2页输出 |
| /career-ops interview-prep | ⚠️ 未测试 | 面试准备（八股文/算法/系统设计/HR面） |
| /career-ops contacto | ⚠️ 未测试 | 脉脉/BOSS直聘/LinkedIn外联消息 |
| /career-ops scan | ⚠️ 半自动 | BOSS直聘需登录，电鸭/V2EX部分可抓 |
| /career-ops batch | ⚠️ 未测试 | 批量处理，需配合 Claude Code headless |
| /career-ops tracker | ⚠️ 未测试 | 投递追踪表 |
| 多岗位对比 | ⚠️ 未测试 | 9维度加权排名 |
| Go TUI 仪表盘 | ⚠️ 未测试 | 终端看板（原版自带，未改动） |

## 快速开始

```bash
git clone https://github.com/YOUR_USERNAME/career-ops-cn.git
cd career-ops-cn && npm install
npx playwright install chromium

# 配置
cp config/profile.example.yml config/profile.yml  # 填入你的信息
cp templates/portals.example.yml portals.yml       # 目标公司

# 在项目根目录创建 cv.md（Markdown 格式简历）
# 可参考 examples/cv-example.md

# 检查环境
npm run doctor

# 开始使用
claude
```

## 使用方式

在 Claude Code 中：

```bash
# 粘贴 JD，自动评分 + 生成 PDF
/career-ops {粘贴JD文本或链接}

# 仅评分
/career-ops oferta

# 生成定制 PDF
/career-ops pdf

# 扫描岗位（半自动）
/career-ops scan
```

或直接用命令生成 PDF：

```bash
node generate-tailored-pdf.mjs --jd /tmp/jd.txt --company 公司名
```

## 已测试 vs 待验证

**已跑通的完整流程：**
1. 粘贴 JD（跨境电商 AI SaaS）→ A-G 评分（综合 4.4/5）
2. 基于 JD 关键词自动改写简历内容 → 填入中文模板 → 生成 PDF（2页，693KB）
3. 评估报告保存 + 投递追踪登记

**已知问题：**
- BOSS直聘/猎聘需要登录，无法全自动抓取 JD
- 部分 mode 文件写了但未实测（见上方功能状态表）
- 原版 Go TUI 仪表盘未适配中文
- 中文字体文件较大（~8MB），建议用 Git LFS 或单独下载

## 技术栈

- Node.js（脚本 + Playwright）
- Go（TUI 仪表盘，原版自带）
- Claude Code（AI 驱动）

## 协议

MIT，基于 [santifer/career-ops](https://github.com/santifer/career-ops)

## 贡献

欢迎提 Issue 和 PR，尤其以下方向：
- 更多国内招聘平台适配
- 未测试 mode 的验证和 bug 修复
- 中文 OCR 简历导入
- AI API 集成（脱离 Claude Code 独立运行）
