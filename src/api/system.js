// 系统设置管理相关API
import request from '@/utils/request'

// 获取用户列表
export const getUserList = (params) => {
  return request({
    url: '/system/user/list',
    method: 'get',
    params
  })
}

// 获取用户详情
export const getUserDetail = (id) => {
  return request({
    url: `/system/user/detail/${id}`,
    method: 'get'
  })
}

// 创建用户
export const createUser = (data) => {
  return request({
    url: '/system/user/create',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  return request({
    url: `/system/user/update/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  return request({
    url: `/system/user/delete/${id}`,
    method: 'delete'
  })
}

// 获取角色列表
export const getRoleList = () => {
  return request({
    url: '/system/role/list',
    method: 'get'
  })
}

// 获取系统配置
export const getSystemConfig = () => {
  return request({
    url: '/system/config',
    method: 'get'
  })
}

// 更新系统配置
export const updateSystemConfig = (data) => {
  return request({
    url: '/system/config/update',
    method: 'put',
    data
  })
}
