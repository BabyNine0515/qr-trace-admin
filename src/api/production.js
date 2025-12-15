// 品牌故事相关API
import request from '@/utils/request'

// 创建品牌故事
export const createBrandStory = (data) => {
  return request({
    url: '/brand-story',
    method: 'post',
    data
  })
}

// 获取品牌故事列表
export const getBrandStoryList = (params) => {
  return request({
    url: '/brand-story/list',
    method: 'get',
    params
  })
}

// 修改品牌故事
export const updateBrandStory = (data) => {
  return request({
    url: '/brand-story',
    method: 'put',
    data
  })
}

// 删除品牌故事
export const deleteBrandStory = (params) => {
  return request({
    url: '/brand-story',
    method: 'delete',
    params
  })
}

// 获取上游生产信息列表
export const getUpstreamInfoList = (params) => {
  return request({
    url: '/production/upstream-info/list',
    method: 'get',
    params
  })
}

// 获取上游生产信息详情
export const getUpstreamInfoDetail = (id) => {
  return request({
    url: `/production/upstream-info/detail/${id}`,
    method: 'get'
  })
}

// 创建上游生产信息
export const createUpstreamInfo = (data) => {
  return request({
    url: '/production/upstream-info/create',
    method: 'post',
    data
  })
}

// 更新上游生产信息
export const updateUpstreamInfo = (id, data) => {
  return request({
    url: `/production/upstream-info/update/${id}`,
    method: 'put',
    data
  })
}

// 删除上游生产信息
export const deleteUpstreamInfo = (id) => {
  return request({
    url: `/production/upstream-info/delete/${id}`,
    method: 'delete'
  })
}

// 获取生产厂家列表
export const getManufacturerList = (params) => {
  return request({
    url: '/production/manufacturer/list',
    method: 'get',
    params
  })
}

// 获取生产厂家详情
export const getManufacturerDetail = (id) => {
  return request({
    url: `/production/manufacturer/detail/${id}`,
    method: 'get'
  })
}

// 创建生产厂家
export const createManufacturer = (data) => {
  return request({
    url: '/production/manufacturer/create',
    method: 'post',
    data
  })
}

// 更新生产厂家
export const updateManufacturer = (id, data) => {
  return request({
    url: `/production/manufacturer/update/${id}`,
    method: 'put',
    data
  })
}

// 删除生产厂家
export const deleteManufacturer = (id) => {
  return request({
    url: `/production/manufacturer/delete/${id}`,
    method: 'delete'
  })
}
