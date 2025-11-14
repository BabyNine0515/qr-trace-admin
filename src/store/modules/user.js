// 移除未使用的API导入，使用文件内的模拟实现
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login - 模拟登录，不需要真实后端
  login({ commit }, userInfo) {
    const { username } = userInfo
    return new Promise((resolve, reject) => {
      // 模拟API调用延迟
      setTimeout(() => {
        // 验证用户名（使用validate.js中的验证规则）
        if (username.trim() !== 'admin' && username.trim() !== 'editor') {
          reject('用户名不存在')
          return
        }

        // 模拟成功登录，生成token
        const mockToken = username.trim() + '-token'
        const mockUserInfo = {
          roles: username.trim() === 'admin' ? ['admin'] : ['editor'],
          name: username.trim() === 'admin' ? '超级管理员' : '编辑者',
          avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
          introduction: '我是一名' + (username.trim() === 'admin' ? '超级管理员' : '编辑者')
        }

        // 存储用户信息到localStorage供getInfo使用
        localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))

        commit('SET_TOKEN', mockToken)
        setToken(mockToken)
        resolve()
      }, 500)
    })
  },

  // get user info - 模拟获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve) => {
      // 模拟API调用延迟
      setTimeout(() => {
        try {
          // 从localStorage获取用户信息
          const userInfoStr = localStorage.getItem('userInfo')
          let data

          if (!userInfoStr) {
            // 如果localStorage中没有用户信息，使用默认管理员角色
            console.log('未找到用户信息，使用默认管理员角色')
            data = {
              roles: ['admin'],
              name: '超级管理员',
              avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
              introduction: '我是一名超级管理员'
            }
            // 保存默认信息到localStorage
            localStorage.setItem('userInfo', JSON.stringify(data))
          } else {
            data = JSON.parse(userInfoStr)

            // 确保数据存在且roles有效
            if (!data || !data.roles || data.roles.length <= 0) {
              console.log('用户信息不完整，使用默认管理员角色')
              data = {
                roles: ['admin'],
                name: '超级管理员',
                avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
                introduction: '我是一名超级管理员'
              }
              localStorage.setItem('userInfo', JSON.stringify(data))
            }
          }

          const { roles, name, avatar, introduction } = data

          commit('SET_ROLES', roles)
          commit('SET_NAME', name)
          commit('SET_AVATAR', avatar)
          commit('SET_INTRODUCTION', introduction)
          resolve(data)
        } catch (error) {
          console.error('获取用户信息出错:', error)
          // 出错时使用默认管理员角色
          const defaultData = {
            roles: ['admin'],
            name: '超级管理员',
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            introduction: '我是一名超级管理员'
          }
          commit('SET_ROLES', defaultData.roles)
          commit('SET_NAME', defaultData.name)
          commit('SET_AVATAR', defaultData.avatar)
          commit('SET_INTRODUCTION', defaultData.introduction)
          localStorage.setItem('userInfo', JSON.stringify(defaultData))
          resolve(defaultData)
        }
      }, 300)
    })
  },

  // user logout - 模拟登出
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      // 模拟API调用延迟
      setTimeout(() => {
        try {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          // 清除localStorage中的用户信息
          localStorage.removeItem('userInfo')
          // 清除溯源码数据（可选，根据需求决定）
          // localStorage.removeItem('traceabilityCodes')
          resetRouter()

          // reset visited views and cached views
          // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
          dispatch('tagsView/delAllViews', null, { root: true })

          resolve()
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      // 清除localStorage中的用户信息
      localStorage.removeItem('userInfo')
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

// --------------------------------------------------------------------------------
// 调接口获取用户信息
// const actions = {
//   // 用户登录
//   login({ commit }, userInfo) {
//     const { username, password } = userInfo
//     return new Promise((resolve, reject) => {
//       login({
//         username: username.trim(),
//         password: password
//       }).then(response => {
//         const { data } = response
//         // 假设后端返回的数据结构：
//         // { code: 200, data: { token: 'xxx', userInfo: {...} }, message: 'success' }
//         if (data.code === 200) {
//           // 保存 token 到 cookie 或 localStorage
//           commit('SET_TOKEN', data.data.token)
//           setToken(data.data.token)
//           // 保存用户信息
//           commit('SET_USER_INFO', data.data.userInfo)
//           resolve()
//         } else {
//           reject(new Error(data.message || '登录失败'))
//         }
//       }).catch(error => {
//         reject(error)
//       })
//     })
//   },

//   // 获取用户信息
//   getInfo({ commit, state }) {
//     return new Promise((resolve, reject) => {
//       getInfo(state.token).then(response => {
//         const { data } = response

//         if (!data) {
//           reject(new Error('验证失败，请重新登录'))
//         }

//         const { roles, name, avatar, introduction } = data

//         // 角色必须是非空数组
//         if (!roles || roles.length <= 0) {
//           reject(new Error('getInfo: roles must be a non-null array!'))
//         }

//         commit('SET_ROLES', roles)
//         commit('SET_NAME', name)
//         commit('SET_AVATAR', avatar)
//         commit('SET_INTRODUCTION', introduction)
//         resolve(data)
//       }).catch(error => {
//         reject(error)
//       })
//     })
//   },

//   // 用户退出
//   logout({ commit, state }) {
//     return new Promise((resolve, reject) => {
//       logout(state.token).then(() => {
//         commit('SET_TOKEN', '')
//         commit('SET_ROLES', [])
//         removeToken()
//         resetRouter()
//         resolve()
//       }).catch(error => {
//         reject(error)
//       })
//     })
//   }
// }

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
