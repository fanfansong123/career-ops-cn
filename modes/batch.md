# Mode: batch -- 批量处理

两种使用模式：**conductor --chrome**（实时导航招聘平台）或 **standalone**（处理已收集的 URL）。

## 架构

```text
Conductor（有头浏览器模式）
  │
  │  Chrome: 导航招聘平台（已登录会话）
  │  直接读取 DOM — 用户实时看到一切
  │
  ├─ 岗位1: 从 DOM 读取 JD + URL
  │    └─► headless worker → 报告 .md + PDF + 追踪行
  │
  ├─ 岗位2: 点击下一个，读取 JD + URL
  │    └─► headless worker → 报告 .md + PDF + 追踪行
  │
  └─ 结束: 合并 tracker-additions → applications.md + 摘要
```

每个 worker 是独立的 headless 子进程，拥有干净的 200K token 上下文。conductor 只负责编排。

## 文件

```text
batch/
  batch-input.tsv               # URL（来自 conductor 或手动）
  batch-state.tsv               # 进度（自动生成，gitignored）
  batch-runner.sh               # Standalone 编排脚本
  batch-prompt.md               # Worker 的 prompt 模板
  logs/                         # 每个岗位一个日志（gitignored）
  tracker-additions/            # 追踪行（gitignored）
```

## Mode A: Conductor --chrome

1. **读取状态**: `batch/batch-state.tsv` → 识别已处理的
2. **导航平台**: Chrome → 搜索 URL
3. **提取 URL**: 读取结果 DOM → 提取 URL 列表 → 追加到 batch-input.tsv
4. **对每个待处理 URL**:
   a. Chrome: 点击岗位 → 从 DOM 读取 JD 文本
   b. 保存 JD 到 `/tmp/batch-jd-{id}.txt`
   c. 计算下一个 REPORT_NUM
   d. 通过 Bash 执行 worker
   e. 更新 `batch-state.tsv`（completed/failed + score + report_num）
   f. 记录日志到 `logs/{report_num}-{id}.log`
   g. Chrome: 返回 → 下一个岗位
5. **分页**: 如无更多岗位 → 点击"下一页" → 重复
6. **结束**: 合并 tracker-additions → applications.md + 摘要

## Mode B: Standalone 脚本

```bash
batch/batch-runner.sh [OPTIONS]
```

选项：
- `--dry-run` — 列出待处理岗位，不执行
- `--retry-failed` — 仅重试失败的
- `--start-from N` — 从 ID N 开始
- `--parallel N` — N 个并行 worker
- `--max-retries N` — 每个岗位重试次数（默认2）

## 错误处理

| 错误 | 恢复 |
|------|------|
| URL 不可访问 | Worker 失败 → conductor 标记 failed，继续 |
| JD 需要登录 | Conductor 尝试读取 DOM，失败 → failed |
| 平台布局变化 | Conductor 自适应 HTML |
| Worker 崩溃 | Conductor 标记 failed，继续。使用 --retry-failed 重试 |
| Conductor 崩溃 | 重新运行 → 读取状态 → 跳过已完成 |
| PDF 失败 | .md 报告已保存，PDF 待生成 |
