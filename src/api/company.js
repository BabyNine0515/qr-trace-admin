// 商户管理相关API
import request from '@/utils/request'

// 创建商户
export const createMerchant = (data) => {
  return request({
    url: '/merchant',
    method: 'post',
    data
  })
}

// 获取商户列表
export const getMerchantList = (params) => {
  return request({
    url: '/merchant/list',
    method: 'get',
    params
  })
}

// 修改商户
export const updateMerchant = (data) => {
  return request({
    url: '/merchant',
    method: 'put',
    data
  })
}

// 删除商户
export const deleteMerchant = (id) => {
  return request({
    url: '/merchant',
    method: 'delete',
    params: { id }
  })
}

// 获取生产方列表
export const getManufacturerList = (params) => {
  return request({
    url: '/merchant/list',
    method: 'get',
    params
  })
}

// 获取材料放列表
export const getSupplierList = (params) => {
  return request({
    url: '/merchant/list',
    method: 'get',
    params
  })
}
