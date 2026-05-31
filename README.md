# Career-Ops-CN

[career-ops](https://github.com/santifer/career-ops) (46k+ stars, MIT) 的中国本地化版本，适配国内招聘场景。

基于 Claude Code 的 AI 求职指挥中心：粘贴一份 JD，自动完成岗位评分、简历定制和面试准备。

> ⚠️ **当前状态：v0.1.0，核心功能已测试，持续完善中。**

## 与原版的区别

| | 原版 career-ops | career-ops-cn |
|---|---|---|
| 评分维度 | 6维度含 Cultural signals | 五险一金/公积金/年终奖/试用期/期权 |
| 薪资数据源 | Glassdoor / Levels.fyi | 脉脉 / offershow / 牛客 |
| 简历模板 | 英文，Space Grotesk 字体 | 中文，阿里巴巴普惠体，A4 |
| 招聘平台 | Greenhouse / Ashby / Lever | BOSS直聘 / 猎聘 / 拉勾（Bookmarklet 一键捕获） |
| 面试准备 | STAR+R | STAR+R + 八股文 + 算法刷题 + HR面 + 差距分析 |
| 外联 | LinkedIn | 脉脉 / BOSS直聘 / LinkedIn / 微信 |
| 公司库 | 45+ 海外公司 | 35+ 国内公司 |

## 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| /career-ops {JD} 评分 | ✅ 已测试 | A-G 七维度完整评估，含岗位真实性判断 |
| PDF 简历生成 | ✅ 已测试 | 根据 JD 定制，AI 改写内容，A4 中文 |
| /career-ops interview-prep | ✅ 已测试 | 八股文/算法/系统设计/HR面 + JD差距分析+学习路线 |
| /career-ops contacto | ✅ 已测试 | 脉脉/BOSS直聘/LinkedIn 外联消息生成 |
| /career-ops ofertas | ✅ 已测试 | 多岗位 9 维度加权对比排名 |
| /career-ops deep | ✅ 已测试 | 6 维度深度公司研究 |
| /career-ops tracker | ✅ 已测试 | 投递追踪看板 |
| /career-ops scan | ✅ 已测试 | 搜索引擎 + Bookmarklet 双通道扫岗位 |
| **Bookmarklet JD 捕获** | ✅ 已测试 | 一键从 BOSS直聘/猎聘 页面提取 5 字段 |
| /career-ops training | ✅ 已测试 | 培训/证书/项目 6 维度价值评估 |
| /career-ops project | ✅ 已测试 | 作品集项目方向评估 |
| 批量评估 | ✅ 已测试 | Bookmarklet 攒 JD → --batch 一键生成评估提示词 |
| /career-ops update | ✅ 已适配 | 指向 career-ops-cn 仓库 |
| Go TUI 仪表盘 | ⚠️ 未适配 | 终端看板（原版自带） |

## 快速开始

```bash
git clone https://github.com/fanfansong123/career-ops-cn.git
cd career-ops-cn && npm install

# 配置
cp config/profile.example.yml config/profile.yml  # 填入你的信息
cp templates/portals.example.yml portals.yml       # 目标公司

# 在项目根目录创建 cv.md（Markdown 格式简历）

# 检查环境
npm run doctor

# 开始使用
claude
```

## 使用方式

### AI 模式（Claude Code 中）

```bash
# 粘贴 JD，自动评分 + 生成 PDF
/career-ops {粘贴JD文本或链接}

# 仅评分
/career-ops oferta

# 多岗位对比排名
/career-ops ofertas

# 生成定制 PDF
/career-ops pdf

# 扫描岗位
/career-ops scan

# 面试准备（含差距分析 + 学习路线）
/career-ops interview-prep

# 深度公司研究
/career-ops deep

# 外联消息生成
/career-ops contacto

# 投递追踪
/career-ops tracker

# 培训/项目价值评估
/career-ops training
/career-ops project
```

### Bookmarklet 一键捕获 JD（推荐）

适用场景：在 BOSS直聘 / 猎聘 上看到岗位，一键提取 JD 到本地。

```
1. 启动本地入箱服务器:
   node tools/jd-inbox-server.mjs

2. 浏览器打开 http://localhost:8787

3. 把页面上的按钮拖到书签栏

4. 打开 BOSS直聘/猎聘 详情页 → 点击书签栏按钮 → JD 自动保存到 jds/

5. 回到终端: node tools/process-jds.mjs 查看待处理 JD

6. 单个: 把 JD 文本粘贴给我 → 跑 oferta 评分

7. 批量: node tools/process-jds.mjs --batch → 粘贴给我 → 统一评估
```

**原理：** Bookmarklet 是一段保存在书签栏的 JavaScript。点击后在你已登录的页面内运行，直接读取 DOM 提取公司名、岗位名、薪资、地点、经验、JD 正文，通过 fetch 发送到本地服务器。完全绕开反爬，不需要 Playwright。

| Bookmarklet | 适用平台 |
|------|------|
| BOSS直聘 | zhipin.com 职位详情页 |
| 猎聘 | liepin.com 职位详情页 |
| 通用版 | 字节/阿里/腾讯/美团/拉勾/电鸭/V2EX 等 |

## 已跑通

1. **JD 捕获**: Bookmarklet 一键从 BOSS直聘提取 JD（公司/岗位/薪资/地点/经验 5 字段）
2. **自动评分**: 粘贴 JD → A-G 七维度评估（含薪资调研 + 岗位真实性判断）
3. **PDF 生成**: JD 关键词注入 + 阿里普惠体中文字体 + A4 输出
4. **面试准备**: 八股文 + 算法刷题 + 系统设计 + STAR 故事库 + JD 差距分析 + 学习路线
5. **多岗位对比**: 9 维度加权排名 + 时间因素策略建议
6. **深度公司研究**: 6 维度（技术战略/近期动态/工程文化/技术挑战/竞品/候选人角度）
7. **外联消息**: 脉脉/BOSS直聘/LinkedIn 三大平台，按 HR/技术负责人/同行 分类生成
8. **批量评估**: Bookmarklet 逐条捕获 → process-jds --batch 生成提示词 → 统一评估
9. **投递追踪**: 状态流转（已评估→已投递→面试中→Offer） + 统计
10. **培训评估**: 6 维度评估培训/证书/项目价值 + 替代方案对比

## 已知问题

- BOSS直聘/猎聘 DOM 结构可能变化，Bookmarklet 需偶尔更新选择器
- `patterns`（被拒分析）和 `followup`（跟进提醒）需较多投递数据才能发挥价值，未实测
- 原版 Go TUI 仪表盘未适配中文
- 中文字体文件较大（~8MB），首次生成 PDF 需加载

## 技术栈

- Node.js（脚本 + Playwright + JD Inbox Server）
- Claude Code（AI 驱动评估/简历生成/面试准备）
- Go（TUI 仪表盘，原版自带）

## 协议

MIT，基于 [santifer/career-ops](https://github.com/santifer/career-ops)

## 贡献

欢迎提 Issue 和 PR，尤其以下方向：
- 更多国内招聘平台 Bookmarklet 适配
- 未测试 mode 的验证和 bug 修复
- AI API 集成（脱离 Claude Code 独立运行）
