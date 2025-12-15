import request from '@/utils/request'

// 用户登录
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/change-password',
    method: 'post',
    data
  })
}

// 用户退出
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
