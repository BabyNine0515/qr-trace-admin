import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}

// --------------------------------------------------------------------------------
// 调接口获取用户信息
// import request from '@/utils/request'

// // 用户登录
// export function login(data) {
//   return request({
//     url: '/api/auth/login', // 根据你的后端接口调整
//     method: 'post',
//     data
//   })
// }

// // 获取用户信息
// export function getInfo(token) {
//   return request({
//     url: '/api/auth/userinfo', // 根据你的后端接口调整
//     method: 'get',
//     params: { token }
//   })
// }

// // 用户退出
// export function logout() {
//   return request({
//     url: '/api/auth/logout', // 根据你的后端接口调整
//     method: 'post'
//   })
// }
