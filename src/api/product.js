// 产品管理相关API
import request from '@/utils/request'

// 获取产品列表
export const getProductList = (params) => {
  return request({
    url: '/product/list',
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
    url: '/product/create',
    method: 'post',
    data
  })
}

// 更新产品
export const updateProduct = (id, data) => {
  return request({
    url: `/product/update/${id}`,
    method: 'put',
    data
  })
}

// 删除产品
export const deleteProduct = (id) => {
  return request({
    url: `/product/delete/${id}`,
    method: 'delete'
  })
}

// 批量删除产品
export const batchDeleteProduct = (ids) => {
  return request({
    url: '/product/batch-delete',
    method: 'delete',
    data: { ids }
  })
}

// 发布产品
export const publishProduct = (id, data) => {
  return request({
    url: `/product/publish/${id}`,
    method: 'put',
    data
  })
}

// 获取产品分类
export const getProductCategories = () => {
  return request({
    url: '/product/categories',
    method: 'get'
  })
}

// 获取产品属性
export const getProductAttributes = (categoryId) => {
  return request({
    url: '/product/attributes',
    method: 'get',
    params: { categoryId }
  })
}

// 获取产品库存
export const getProductStock = (productId) => {
  return request({
    url: `/product/stock/${productId}`,
    method: 'get'
  })
}

// 更新产品库存
export const updateProductStock = (productId, data) => {
  return request({
    url: `/product/stock/update/${productId}`,
    method: 'put',
    data
  })
}