import { login, logout } from '@/api/user'
import { getToken, setToken, removeToken, getUserId, setUserId, removeUserId } from '@/utils/auth'
import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  id: getUserId(),
  name: '',
  avatar: '',
  introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ID: (state, id) => {
    state.id = id
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
    console.log('SET_ROLES mutation executed with:', roles)
    console.log('Before SET_ROLES - current roles:', state.roles)
    state.roles = roles
    console.log('After SET_ROLES - new roles:', state.roles)
  }
}

const actions = {
  // user login
  login({ commit, dispatch }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response
          // API response structure: { code: 200, data: { token: 'xxx', admin: {...} }, message: 'success' }

          // 存储token
          commit('SET_TOKEN', data.token)
          setToken(data.token)

          // 直接从登录接口获取用户信息并存储
          if (data.admin) {
            const admin = data.admin
            // 设置用户ID
            commit('SET_ID', admin.id)
            setUserId(admin.id)
            // 设置用户名
            commit('SET_NAME', admin.username || admin.name || 'Admin')
            // 设置头像（使用默认头像）
            commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
            // 设置简介
            commit('SET_INTRODUCTION', '管理员')
            // 设置角色（只要登录成功，默认分配管理员角色）
            const roles = ['admin']
            commit('SET_ROLES', roles)

            // 生成并加载动态路由，确保登录后页面能正常显示
            dispatch('permission/generateRoutes', roles, { root: true })
              .then(accessRoutes => {
                // 动态添加可访问路由
                router.addRoutes(accessRoutes)
                // 确保路由数据已经完全提交到Vuex后再完成登录流程
                // 这样登录成功后跳转时，侧边栏组件就能立即获取到完整的路由数据
                // 使用setTimeout确保异步操作完成
                setTimeout(() => {
                  resolve()
                }, 0)
              })
              .catch(err => {
                console.error('Failed to generate routes:', err)
                resolve() // 即使路由生成失败，也要让登录流程继续
              })
          } else {
            resolve()
          }
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // get user info - 直接从state获取，不再调用API
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      try {
        console.log('=== START getInfo (local) ===')

        // 检查是否有有效的用户信息
        if (!state.name || !state.roles.length) {
          console.warn('No user info found in state, using default values')
          // 设置默认角色，确保菜单能正常显示
          commit('SET_ROLES', ['admin'])
          commit('SET_NAME', 'Admin')
          commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
          commit('SET_INTRODUCTION', '管理员')
        }

        // 直接返回state中的用户信息
        const userInfo = {
          ...state,
          data: {
            roles: state.roles,
            name: state.name,
            avatar: state.avatar,
            introduction: state.introduction
          }
        }

        console.log('User info from state:', userInfo)
        console.log('=== END getInfo (local) ===')
        resolve(userInfo)
      } catch (error) {
        console.error('Error in getInfo:', error)
        reject(error)
      }
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ID', '')
          commit('SET_ROLES', [])
          removeToken()
          removeUserId()
          resetRouter()

          // reset visited views and cached views
          dispatch('tagsView/delAllViews', null, { root: true })

          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ID', '')
      commit('SET_ROLES', [])
      removeToken()
      removeUserId()
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

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
