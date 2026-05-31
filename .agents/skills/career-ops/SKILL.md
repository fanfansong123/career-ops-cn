---
name: career-ops
description: AI求职指挥中心 -- 评估岗位、生成简历、扫描招聘平台、追踪投递进度
arguments: mode # Claude Code specific
user-invocable: true
argument-hint: "[scan | deep | pdf | oferta | ofertas | apply | batch | tracker | pipeline | contacto | training | project | interview-prep | update]"
license: MIT
---

# career-ops -- 路由器

## 模式路由

根据 `$mode` 决定执行模式：

| 输入 | 模式 |
|------|------|
| (空 / 无参数) | `discovery` -- 显示命令菜单 |
| JD 文本或 URL（无子命令） | **`auto-pipeline`** |
| `oferta` | `oferta` |
| `ofertas` | `ofertas` |
| `contacto` | `contacto` |
| `deep` | `deep` |
| `interview-prep` | `interview-prep` |
| `pdf` | `pdf` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `batch` | `batch` |
| `patterns` | `patterns` |
| `followup` | `followup` |
| `update` | `update` |

**自动管道检测：** 如果 `$mode` 不是已知子命令且包含 JD 文本（关键词："岗位职责"、"任职要求"、"职位描述"、"工作内容"、"我们希望你"、公司名+岗位名）或 JD 的 URL，执行 `auto-pipeline`。

如果 `$mode` 不是子命令且不像 JD，显示发现菜单。

---

## Discovery 模式（无参数）

显示此菜单：

```
career-ops -- AI求职指挥中心

可用命令：
  /career-ops {JD}      → 自动管道：粘贴JD文本或链接，自动评估+报告+PDF+追踪
  /career-ops pipeline  → 处理待处理URL队列（从 data/pipeline.md）
  /career-ops oferta    → 仅A-F评估（不自动生成PDF）
  /career-ops ofertas   → 对比多个offer并排名
  /career-ops contacto  → 脉脉/LinkedIn外联：找人+写消息
  /career-ops deep      → 深度公司研究
  /career-ops interview-prep → 生成针对公司的面试准备材料（含八股文+算法+系统设计+HR面）
  /career-ops pdf       → 仅生成PDF，ATS优化中文简历
  /career-ops training  → 评估培训/证书对目标岗位的价值
  /career-ops project   → 评估作品集项目方向
  /career-ops tracker   → 投递状态总览
  /career-ops apply     → 实时投递助手（读表单+生成回答）
  /career-ops scan      → 扫描招聘平台，发现新岗位
  /career-ops batch     → 批量处理，并行worker评估
  /career-ops patterns  → 分析被拒规律，优化投递方向
  /career-ops followup  → 跟进提醒：标记超时应跟进、生成跟进草稿
  /career-ops update    → 更新 career-ops 系统文件（diff预览+兼容检查）

收件箱：在 data/pipeline.md 中添加URL → /career-ops pipeline
或直接粘贴JD文本运行完整管道。
```

---

## 各模式的上下文加载

确定模式后，执行前加载必要文件：

### 需要 `_shared.md` + 模式文件的模式：
读取 `modes/_shared.md` + `modes/{mode}.md`

适用于：`auto-pipeline`、`oferta`、`ofertas`、`pdf`、`contacto`、`apply`、`pipeline`、`scan`、`batch`

### 独立模式（仅模式文件）：
读取 `modes/{mode}.md`

适用于：`tracker`、`deep`、`interview-prep`、`training`、`project`、`patterns`、`followup`

### 委托给子agent的模式：
对于 `scan`、`apply`（使用Playwright）、`pipeline`（3+ URL）：启动 Agent，将 `_shared.md` + `modes/{mode}.md` 内容注入子agent prompt。

```
Agent(
  subagent_type="general-purpose",
  prompt="[modes/_shared.md 的内容]\n\n[modes/{mode}.md 的内容]\n\n[本次调用的具体数据]",
  description="career-ops {mode}"
)
```

执行加载的模式文件中的指令。
