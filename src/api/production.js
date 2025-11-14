// 生产信息管理相关API
import request from '@/utils/request'

// 获取上游生产信息列表
export const getUpstreamInfoList = (params) => {
  return request({
    url: '/production/upstream/list',
    method: 'get',
    params
  })
}

// 获取上游生产信息详情
export const getUpstreamInfoDetail = (id) => {
  return request({
    url: `/production/upstream/detail/${id}`,
    method: 'get'
  })
}

// 创建上游生产信息
export const createUpstreamInfo = (data) => {
  return request({
    url: '/production/upstream/create',
    method: 'post',
    data
  })
}

// 更新上游生产信息
export const updateUpstreamInfo = (id, data) => {
  return request({
    url: `/production/upstream/update/${id}`,
    method: 'put',
    data
  })
}

// 删除上游生产信息
export const deleteUpstreamInfo = (id) => {
  return request({
    url: `/production/upstream/delete/${id}`,
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
