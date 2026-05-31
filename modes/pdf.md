# Mode: pdf — 中文 ATS 优化 PDF 生成

## 完整流程

1. 读取 `cv.md` 作为唯一的经历来源
2. 如果上下文中没有 JD，向用户索要（文本或 URL）
3. 从 JD 中提取 15-20 个关键词
4. 检测 JD 语言 → 简历语言（中文 JD → 中文简历）
5. 国内岗位默认使用 A4 纸
6. 检测岗位类型 → 调整叙事框架
7. 重写职业概述，注入 JD 关键词 + 差异化故事（"从0到1搭建过日活百万的系统，现在把系统思维应用到 [JD领域]"）
8. 选择与岗位最相关的 3-4 个项目
9. 按 JD 相关度重排工作经历要点
10. 根据 JD 要求构建核心能力网格（6-8个关键词短语）
11. 将关键词自然地融入已有经历（绝不编造）
12. 从模板 + 个性化内容生成完整 HTML
13. 从 `config/profile.yml` 读取姓名 → 转为拼音连字符格式（如 "张三" → "san-zhang"）→ `{candidate}`
14. 将 HTML 写入 `/tmp/cv-{candidate}-{company}.html`
15. 执行：`node generate-pdf.mjs /tmp/cv-{candidate}-{company}.html output/cv-{candidate}-{company}-{YYYY-MM-DD}.pdf --format=a4`
16. 报告：PDF 路径、页数、关键词覆盖率 %

## 工作经历生成规则

- **每家公司独立列出，绝不合并。** 即使两家公司时间相邻、岗位相似，也必须分开写。示例：巍势数码（2014.01-2015.05）和进禹科技（2013.08-2014.01）是两个独立条目。
- 每条包含：公司名、岗位、时间段、一句话概括（1-2行）。具体技术细节留给项目经历部分。
- 早期简短经历（< 1 年）也要独立列出，不可省略或合并。

## 项目经历生成规则

- **所有公司的项目都要包含，不可省略。** 当前主要项目来自 UCloud（占简历主体），但淘米游戏等项目也必须出现，篇幅可以精简但不能完全删除。
- 与 JD 高度相关的项目（当前公司或技能匹配）：详写，包含背景/方案/实现/产出。
- 与 JD 低相关的项目（旧公司或不同技术栈）：简写，1-3 条要点即可，放在"其他项目经历"小节。
- 排序规则：最匹配 JD 的项目排最前，早期项目排后面。
- **项目展开度不变：** 无论 JD 方向如何变化，所有项目的详细程度保持一致。JD 适配只影响排序和关键词强调，不影响项目的展开度。一个项目在 Go 方向 JD 下写多详细，在 Java 方向 JD 下也应该同样详细。

## 中文简历 ATS 规范（确保机器可解析）

- 单栏布局（无侧边栏，无并行列）
- 标准标题："职业概述"、"工作经历"、"教育背景"、"技能"、"证书"、"项目经历"
- 图片/SVG 中不要放文字
- PDF 页眉/页脚不放关键信息（ATS 会忽略）
- UTF-8 编码，文字可选（非图片渲染）
- 无嵌套表格
- JD 关键词分布：职业概述（前5个）、每个岗位第一条要点、技能部分

## PDF 设计

- **字体**：阿里巴巴普惠体 2.0（Regular 正文 + Bold 标题），后备字体 苹方/微软雅黑
- **字体已托管**：`fonts/alibaba-puhuiti-regular.woff2`（4.0MB）+ `fonts/alibaba-puhuiti-bold.woff2`（4.2MB）
- **头部**：姓名 24px Bold + 渐变线 `linear-gradient(to right, hsl(187,74%,32%), hsl(270,70%,45%))` 2px + 联系方式行
- **段落标题**：13px Bold，颜色 cyan 主色，底部边框
- **正文**：10.5px，行高 1.6
- **公司名称**：accent purple 颜色 `hsl(270,70%,45%)`
- **页边距**：上下左右各 0.6in
- **背景**：纯白

## 段落顺序（优化"6秒HR扫读"）

1. 头部（姓名大字、渐变线、联系方式、GitHub/博客链接）
2. 职业概述（2-3行，关键词密集）
3. 核心能力（6-8个关键词标签，flex-grid 布局）
4. 工作经历（倒序）
5. 项目经历（最相关的 3-4 个）
6. 教育背景 & 证书
7. 技能（语言 + 技术）

## 关键词注入策略（伦理、基于事实）

合规改写示例：
- JD 说"高并发系统设计"而简历写"系统性能优化" → 改为"高并发系统设计与性能优化：将核心接口延迟从 800ms 降至 120ms"
- JD 说"微服务治理"而简历写"微服务架构改造" → 改为"微服务治理与架构改造：拆分单体应用为 12 个独立服务"
- JD 说"技术方案设计"而简历写"技术文档编写" → 改为"技术方案设计与落地：主导核心业务系统从0到1的技术方案"

**绝不添加候选人没有的技能。只用 JD 的词汇重新表述真实经历。**

**中文简历特殊注意事项：**
- 中文与英文单词/数字之间加空格："搭建 12 个 Go 微服务"
- 量化指标用阿拉伯数字："800ms"、"10万+用户"、"30%"
- 技术栈名称保持原文不翻译："PostgreSQL"、"Redis"、"Kubernetes"
- 如果投外企，考虑生成中英文双语版本

## 模板 HTML

使用 `templates/cv-template.html` 中的模板。将 `{{...}}` 占位符替换为个性化内容：

| 占位符 | 内容 |
|--------|------|
| `{{LANG}}` | `zh-CN` |
| `{{PAGE_WIDTH}}` | `210mm`（A4） |
| `{{NAME}}` | （来自 profile.yml） |
| `{{PHONE}}` | （来自 profile.yml — 仅当有值时包含；为空时省略） |
| `{{EMAIL}}` | （来自 profile.yml） |
| `{{WECHAT_ROW}}` | 微信号 ` <span class="separator">|</span> <span>微信: xxx</span>`（仅当有值时包含） |
| `{{GITHUB_URL}}` | （来自 profile.yml） |
| `{{GITHUB_DISPLAY}}` | （来自 profile.yml） |
| `{{BLOG_URL}}` | （来自 profile.yml） |
| `{{BLOG_DISPLAY}}` | （来自 profile.yml） |
| `{{LOCATION}}` | （来自 profile.yml） |
| `{{SECTION_SUMMARY}}` | 职业概述 |
| `{{SUMMARY_TEXT}}` | 含关键词的个性化概述 |
| `{{SECTION_COMPETENCIES}}` | 核心能力 |
| `{{COMPETENCIES}}` | `<span class="competency-tag">关键词</span>` × 6-8 |
| `{{SECTION_EXPERIENCE}}` | 工作经历 |
| `{{EXPERIENCE}}` | 每个岗位的 HTML，要点已按 JD 相关度重排 |
| `{{SECTION_PROJECTS}}` | 项目经历 |
| `{{PROJECTS}}` | Top 3-4 项目的 HTML |
| `{{SECTION_EDUCATION}}` | 教育背景 |
| `{{EDUCATION}}` | 教育背景 HTML |
| `{{SECTION_CERTIFICATIONS}}` | 证书/资格 |
| `{{CERTIFICATIONS}}` | 证书 HTML |
| `{{SECTION_SKILLS}}` | 技能 |
| `{{SKILLS}}` | 技能 HTML |

## Canva 简历生成（可选）

如果 `config/profile.yml` 中设置了 `cv.canva_resume_design_id`，生成前让用户选择：
- **"HTML/PDF（快速，ATS优化）"** — 使用上述流程
- **"Canva 简历（可视化，保留设计感）"** — 使用下方流程

如果用户没有 `cv.canva_resume_design_id`，跳过此提示，直接使用 HTML/PDF 流程。

### Canva 工作流

#### Step 1 — 复制基础设计

a. `export-design` 基础设计（使用 `cv.canva_resume_design_id`）导出为 PDF → 获取下载 URL
b. `import-design-from-url` 使用该下载 URL → 创建新的可编辑设计（副本）
c. 记录副本的 `design_id`

#### Step 2 — 读取设计结构

a. `get-design-content` 查看新设计 → 返回所有文本元素（richtexts）及其内容
b. 通过内容匹配将文本元素映射到简历段落：
   - 查找候选人姓名 → 头部段落
   - 查找"职业概述"或"Summary" → 概述段落
   - 查找 cv.md 中的公司名称 → 经历段落
   - 查找学位/学校名称 → 教育段落
   - 查找技能关键词 → 技能段落
c. 如果映射失败，向用户展示找到的内容并请求指导

#### Step 3 — 生成定制内容

与 HTML 流程相同的内容生成（上述步骤 1-11）：
- 用 JD 关键词 + 差异化故事重写职业概述
- 按 JD 相关度重排经历要点
- 根据 JD 要求选择核心能力
- 自然注入关键词（绝不编造）

**重要 — 字符预算规则：** 每个替换文本的长度必须近似于原文本（±15% 字符数）。如果定制内容更长，请缩句。Canva 设计包含固定大小文本框 — 过长文本会导致与相邻元素重叠。统计 Step 2 中每个原始元素的字符数，生成替换内容时强制执行此预算。

#### Step 4 — 应用编辑

a. `start-editing-transaction` 在副本设计上
b. `perform-editing-operations` 使用 `find_and_replace_text` 处理每个段落
c. 文本替换后重排布局
d. `get-design-thumbnail` 确认布局
e. 向用户展示最终预览并请求批准
f. `commit-editing-transaction` 保存（仅在用户批准后）

#### Step 5 — 导出并下载 PDF

a. `export-design` 将副本导出为 PDF（格式：a4）
b. **立即**使用 Bash 下载 PDF：
   ```bash
   curl -sL -o "output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf" "{download_url}"
   ```
c. 验证下载：
   ```bash
   file output/cv-{candidate}-{company}-canva-{YYYY-MM-DD}.pdf
   ```

## 生成后

如果岗位已在追踪表中登记，更新 PDF 列：从 ❌ 改为 ✅。
