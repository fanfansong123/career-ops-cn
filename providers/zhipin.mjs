/**
 * BOSS直聘 职位扫描器 (zhipin.com)
 *
 * 注意：BOSS直聘反爬机制较强，建议使用 Playwright 手动浏览方式而非直接 HTTP 请求。
 * 此模块提供基础的搜索 URL 生成和结果解析框架。
 *
 * 推荐使用方式：配合 /career-ops scan 中的 Playwright 层级进行人工辅助扫描。
 */

/**
 * 生成 BOSS直聘 搜索 URL
 * @param {string} keyword - 搜索关键词（如 "后端开发"）
 * @param {string} city - 城市编码（如 "101010100"=北京, "101020100"=上海）
 * @returns {string} 搜索 URL
 */
export function buildSearchUrl(keyword, city = '101010100') {
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://www.zhipin.com/web/geek/job?query=${encodedKeyword}&city=${city}`;
}

/**
 * 城市编码映射
 */
export const CITY_CODES = {
  '北京': '101010100',
  '上海': '101020100',
  '深圳': '101280600',
  '广州': '101280100',
  '杭州': '101210100',
  '成都': '101270100',
  '南京': '101190100',
  '武汉': '101200100',
  '西安': '101110100',
  '厦门': '101230200',
};

/**
 * 从 BOSS直聘 页面 DOM 中提取职位列表
 * 用于 Playwright browser_snapshot 后解析
 *
 * @param {string} pageSnapshot - Playwright 页面快照文本
 * @returns {Array<{title: string, company: string, salary: string, location: string, url: string}>}
 */
export function parseJobListFromSnapshot(pageSnapshot) {
  const jobs = [];
  // BOSS直聘的职位卡片结构，通过 Playwright snapshot 解析
  // 实际实现需要根据页面 DOM 结构调整
  return jobs;
}

/**
 * BOSS直聘职位 URL 模式
 */
export const URL_PATTERNS = [
  /zhipin\.com\/job_detail\/([a-zA-Z0-9]+)\.html/,
  /zhipin\.com\/web\/geek\/job\?.*/,
];
