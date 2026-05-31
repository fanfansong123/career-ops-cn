# Career-Ops-CN — AI求职指挥中心

基于 [career-ops](https://github.com/santifer/career-ops) (MIT) 的中国本地化版本，适配国内招聘环境。

## 数据契约

| 层 | 文件 | 说明 |
|----|------|------|
| **用户层** | `cv.md`, `config/profile.yml`, `modes/_profile.md`, `portals.yml` | 绝不自动更新 |
| **用户层** | `data/*`, `reports/*`, `output/*`, `interview-prep/*` | 个人数据 |
| **系统层** | `modes/*.md`, `CLAUDE.md`, `*.mjs`, `templates/*` | 可更新 |

规则：用户自定义写入 `modes/_profile.md` 或 `config/profile.yml`，绝不写入 `modes/_shared.md`。

## 与上游的区别

| 原版 | CN版 |
|------|------|
| 评分6维度含 Cultural signals | 去掉文化信号，加入五险一金/公积金/年终奖/试用期 |
| 薪资数据源 Glassdoor/Levels.fyi | 脉脉/offershow/牛客/BOSS直聘 |
| 招聘平台 Greenhouse/Ashby/Lever | BOSS直聘/猎聘/拉勾 + 35家国内公司 |
| 简历字体 Space Grotesk + DM Sans | 阿里巴巴普惠体 2.0 |
| 简历模板英文 | 中文模板（微信联系方式、A4默认） |
| 面试准备 STAR+R | STAR+R + 八股文 + 算法刷题 + HR面 + 群面 |
| 外联 LinkedIn | 脉脉/BOSS直聘/LinkedIn/微信 |

## 关键命令

```bash
npm run doctor          # 检查环境
npm run verify          # 验证管道完整性
npm run pdf             # 生成 PDF
npm run scan-jobs       # 扫描远程岗位
npm run scan-jobs:remote # 扫描远程 Go 岗位
```

## 技能模式（17个）

路由文件：`.agents/skills/career-ops/SKILL.md`
模式文件：`modes/*.md`

核心模式：`auto-pipeline`（粘贴JD→评分+PDF+追踪）、`oferta`（A-G评分）、`pdf`（中文简历生成）
