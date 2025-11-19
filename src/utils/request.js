import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || 'https://trace-api.blockcool.xyz', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // Set Authorization header with Bearer token as per API documentation
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // Success code is 200 as per API documentation
    if (res.code !== 200) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 401: Unauthorized (token invalid or expired)
      if (res.code === 401) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service

// --------------------------------------------------------------------------------
// 调接口获取用户信息
// import axios from 'axios'
// import { Message, MessageBox } from 'element-ui'
// import store from '@/store'
// import { getToken } from '@/utils/auth'

// // 创建axios实例
// const service = axios.create({
//   baseURL: process.env.VUE_APP_BASE_API, // 在 .env 文件中配置后端地址
//   timeout: 5000 // 请求超时时间
// })

// // 请求拦截器
// service.interceptors.request.use(
//   config => {
//     // 在发送请求之前做些什么
//     if (store.getters.token) {
//       // 让每个请求携带token
//       config.headers['Authorization'] = 'Bearer ' + getToken()
//     }
//     return config
//   },
//   error => {
//     // 对请求错误做些什么
//     console.log(error)
//     return Promise.reject(error)
//   }
// )

// // 响应拦截器
// service.interceptors.response.use(
//   response => {
//     const res = response.data

//     // 根据后端返回的code判断请求状态
//     if (res.code !== 200) {
//       Message({
//         message: res.message || 'Error',
//         type: 'error',
//         duration: 5 * 1000
//       })

//       //  token 过期或无效
//       if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
//         // 重新登录
//         MessageBox.confirm('登录状态已过期，请重新登录', '确认退出', {
//           confirmButtonText: '重新登录',
//           cancelButtonText: '取消',
//           type: 'warning'
//         }).then(() => {
//           store.dispatch('user/resetToken').then(() => {
//             location.reload()
//           })
//         })
//       }
//       return Promise.reject(new Error(res.message || 'Error'))
//     } else {
//       return res
//     }
//   },
//   error => {
//     console.log('err' + error)
//     Message({
//       message: error.message,
//       type: 'error',
//       duration: 5 * 1000
//     })
//     return Promise.reject(error)
//   }
// )

// export default service
