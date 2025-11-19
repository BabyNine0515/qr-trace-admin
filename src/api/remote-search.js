import request from '@/utils/request'

/**
 * 远程搜索接口
 * @param {string} keyword - 搜索关键词
 * @param {string} type - 搜索类型 (product|category|user|traceability|upstream|manufacturer)
 * @returns {Promise}
 */
export function remoteSearch(keyword, type) {
  return request({
    url: '/remote-search/select',
    method: 'get',
    params: { keyword, type }
  })
}

/**
 * 搜索产品
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchProduct(keyword) {
  return remoteSearch(keyword, 'product')
}

/**
 * 搜索分类
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchCategory(keyword) {
  return remoteSearch(keyword, 'category')
}

/**
 * 搜索用户
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchUser(keyword) {
  return remoteSearch(keyword, 'user')
}

/**
 * 搜索溯源码
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchTraceability(keyword) {
  return remoteSearch(keyword, 'traceability')
}

/**
 * 搜索上游信息
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchUpstream(keyword) {
  return remoteSearch(keyword, 'upstream')
}

/**
 * 搜索厂家
 * @param {string} keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchManufacturer(keyword) {
  return remoteSearch(keyword, 'manufacturer')
}
