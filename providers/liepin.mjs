/**
 * 猎聘 职位扫描器 (liepin.com)
 *
 * 猎聘偏向中高端岗位，年薪制岗位较多。
 * 此模块提供基础的搜索 URL 生成和结果解析框架。
 */

/**
 * 生成猎聘搜索 URL
 * @param {string} keyword - 搜索关键词
 * @param {string} city - 城市编码（如 "010"=北京, "020"=上海）
 * @returns {string} 搜索 URL
 */
export function buildSearchUrl(keyword, city = '010') {
  const encodedKeyword = encodeURIComponent(keyword);
  return `https://www.liepin.com/zhaopin/?key=${encodedKeyword}&dqs=${city}`;
}

/**
 * 城市编码映射
 */
export const CITY_CODES = {
  '北京': '010',
  '上海': '020',
  '深圳': '050090',
  '广州': '050020',
  '杭州': '070020',
  '成都': '280020',
  '南京': '060020',
  '武汉': '170020',
  '西安': '270020',
};

/**
 * 猎聘职位 URL 模式
 */
export const URL_PATTERNS = [
  /liepin\.com\/job\/([0-9]+)\.shtml/,
  /liepin\.com\/a\/([0-9]+)\.shtml/,
];
