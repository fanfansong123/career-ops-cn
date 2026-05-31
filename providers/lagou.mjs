/**
 * 拉勾 职位扫描器 (lagou.com)
 *
 * 拉勾主要覆盖互联网行业岗位，偏初中级。
 */

/**
 * 生成拉勾搜索 URL
 * @param {string} keyword - 搜索关键词
 * @param {string} city - 城市名（中文，如 "北京"）
 * @returns {string} 搜索 URL
 */
export function buildSearchUrl(keyword, city = '北京') {
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://www.lagou.com/wn/jobs?kd=${encodedKeyword}&city=${encodeURIComponent(city)}`;
}

/**
 * 拉勾职位 URL 模式
 */
export const URL_PATTERNS = [
  /lagou\.com\/jobs\/([0-9]+)\.html/,
  /lagou\.com\/wn\/jobs\/([0-9]+)\.html/,
];
