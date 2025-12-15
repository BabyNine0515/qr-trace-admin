// 产品管理相关API
import request from '@/utils/request'

// 获取产品列表
export const getProductList = (params) => {
  return request({
    url: 'goods/list',
    method: 'get',
    params
  })
}

// 获取产品详情
export const getProductDetail = (id) => {
  return request({
    url: `/product/detail/${id}`,
    method: 'get'
  })
}

// 创建产品
export const createProduct = (data) => {
  return request({
    url: '/goods',
    method: 'post',
    data
  })
}

// 更新产品
export const updateProduct = (data) => {
  return request({
    url: '/goods',
    method: 'put',
    data
  })
}

// 删除产品
export const deleteProduct = (id) => {
  return request({
    url: '/goods',
    method: 'delete',
    params: { id }
  })
}

// 批量删除产品 - 新API未明确支持，暂时保留旧接口
export const batchDeleteProduct = (ids) => {
  return request({
    url: '/product/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 发布产品 - 新API未明确支持，暂时保留旧接口
export const publishProduct = (id, data) => {
  return request({
    url: `/product/publish/${id}`,
    method: 'put',
    data
  })
}

// 获取产品分类 - 新API未明确支持，暂时保留旧接口
export const getProductCategories = () => {
  return request({
    url: '/product/categories',
    method: 'get'
  })
}

// 获取产品属性 - 新API未明确支持，暂时保留旧接口
export const getProductAttributes = (categoryId) => {
  return request({
    url: '/product/attributes',
    method: 'get',
    params: { categoryId }
  })
}

// 获取产品库存 - 新API未明确支持，暂时保留旧接口
export const getProductStock = (productId) => {
  return request({
    url: `/product/stock/${productId}`,
    method: 'get'
  })
}

// 更新产品库存 - 新API未明确支持，暂时保留旧接口
export const updateProductStock = (productId, data) => {
  return request({
    url: `/product/stock/update/${productId}`,
    method: 'put',
    data
  })
}

// 批次管理相关API

// 创建批次
export const createBatch = (data) => {
  return request({
    url: '/batch',
    method: 'post',
    data
  })
}

// 获取批次列表
export const getBatchList = (params) => {
  return request({
    url: '/batch/list',
    method: 'get',
    params
  })
}

// 修改批次
export const updateBatch = (data) => {
  return request({
    url: '/batch',
    method: 'put',
    data
  })
}

// 删除批次
export const deleteBatch = (id) => {
  return request({
    url: '/batch',
    method: 'delete',
    params: { id }
  })
}
