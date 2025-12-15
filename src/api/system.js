// 系统设置管理相关API
import request from '@/utils/request'

// 获取管理员列表
export const getUserList = (params) => {
  return request({
    url: '/admin/list',
    method: 'get',
    params
  })
}

// 创建管理员
export const createUser = (data) => {
  return request({
    url: '/admin',
    method: 'post',
    data
  })
}

// 更新管理员
export const updateUser = (id, data) => {
  return request({
    url: `/admin`,
    method: 'put',
    data
  })
}

// 删除管理员
export const deleteUser = (id) => {
  return request({
    url: `/admin`,
    method: 'delete',
    params: { id }
  })
}

