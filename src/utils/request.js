import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API || 'https://dev.xiangtaihou-food.com/traceability-code-service/admin', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    const token = getToken()
    if (token) {
      // Set Authorization header with Bearer token as per API documentation
      config.headers['Authorization'] = 'Bearer ' + token
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
    // 检查响应数据是否存在
    if (!response || !response.data) {
      Message({
        message: '服务器返回数据格式错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error('服务器返回数据格式错误'))
    }

    const res = response.data
    // Success code is 200 as per API documentation
    if (res.code !== 200) {
      Message({
        message: res.message || '操作失败',
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
      return Promise.reject(new Error(res.message || '操作失败'))
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
