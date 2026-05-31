# Mode: pipeline -- URL 收件箱（第二大脑）

处理存储在 `data/pipeline.md` 中的岗位 URL。用户随时添加 URL，然后执行 `/career-ops pipeline` 批量处理。

## 工作流

1. **读取** `data/pipeline.md` → 搜索"待处理"区块中的 `- [ ]` 项
2. **对每个待处理 URL**：
   a. 计算下一个序号 REPORT_NUM（读取 reports/，取最大编号+1）
   b. **提取 JD** 使用 Playwright（browser_navigate + browser_snapshot）→ WebFetch → WebSearch
   c. 如果 URL 不可访问 → 标记为 `- [!]` 并标注原因，继续
   d. **执行完整 auto-pipeline**: A-F 评估 → 报告 .md → PDF（如评分 >= 3.0）→ 追踪表
   e. **从"待处理"移动到"已处理"**: `- [x] #NNN | URL | 公司 | 岗位 | 评分/5 | PDF ✅/❌`
3. **如果有 3+ 待处理 URL**，启动并行 agent（Agent 工具 + run_in_background）最大化速度。
4. **结束时**，显示摘要表格

## pipeline.md 格式

```markdown
## 待处理
- [ ] https://www.zhipin.com/job_detail/xxx.html
- [ ] https://www.liepin.com/job/xxx.shtml | 某科技公司 | 高级后端
- [!] https://private.url/job — 错误: 需要登录

## 已处理
- [x] #001 | https://... | 字节跳动 | 后端开发 | 4.2/5 | PDF ✅
- [x] #002 | https://... | 美团 | 架构师 | 3.1/5 | PDF ❌
```

## 从 URL 智能检测 JD

1. **Playwright（首选）:** `browser_navigate` + `browser_snapshot`
2. **WebFetch（备选）:** 静态页面或 Playwright 不可用时
3. **WebSearch（最后手段）:** 在二级门户搜索

**特殊情况:**
- **BOSS直聘/猎聘**: 可能需要登录 → 标记 `[!]` 请用户粘贴文本
- **PDF**: 如果 URL 指向 PDF，直接用 Read 工具读取
- **`local:` 前缀**: 读取本地文件。示例: `local:jds/liepin-pm-ai.md`
