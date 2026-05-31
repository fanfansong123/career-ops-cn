# Mode: update -- 交互式系统更新

当用户运行 `/career-ops update` 时，执行此交互式更新流程。

## Step 1 — 检查更新

运行 `node update-system.mjs check` 并解析 JSON 输出。

- 如果 `up-to-date`: 告诉用户"career-ops 已是最新版本 (v{version})。"停止。
- 如果 `offline`: 告诉用户"无法连接到 GitHub 检查更新。请稍后再试。"停止。
- 如果 `update-available`: 继续 Step 2。

## Step 2 — 展示变更内容

向用户展示将要变更的内容。

## Step 3 — 兼容性检查

应用更新前，检查更新是否可能影响用户的自定义：

1. 读取 `modes/_profile.md`（如存在）
2. 对比更新前后的 `modes/_shared.md`
3. 检查岗位类型变更、评分系统变更、新模式文件

## Step 4 — 确认并应用

询问用户确认：
> "准备好更新了。应用变更吗？（可通过 /career-ops update rollback 回滚）"

如果确认：
1. 运行 `node update-system.mjs apply`
2. 运行 `node doctor.mjs` 验证安装
3. 显示最终状态

如果拒绝：
1. 运行 `node update-system.mjs dismiss`
2. 告知用户可以随时执行 /career-ops update 重新检查。

## Step 5 — 回滚（如需要）

如果用户要求回滚：
1. 运行 `node update-system.mjs rollback`
2. 展示恢复的内容。

## 规则

- 绝不自动修改用户层文件（cv.md、profile.yml、data/、reports/、output/、portals.yml）
- `modes/_profile.md` 也是用户层文件
- 用户特定自定义放在 `modes/_profile.md` 或 `config/profile.yml`，绝不放在 `modes/_shared.md`
- 如果出错，告知用户运行回滚
