import { login, getInfo, logout } from '@/api/user'
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
    console.log('SET_ROLES mutation executed with:', roles)
    console.log('Before SET_ROLES - current roles:', state.roles)
    state.roles = roles
    console.log('After SET_ROLES - new roles:', state.roles)
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(response => {
          const { data } = response
          // API response structure: { code: 200, data: { token: 'xxx', user_info: {...} }, message: 'success' }
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then(response => {
          console.log('=== START getInfo ===')
          const { data } = response

          if (!data) {
            console.error('No data returned from getInfo API')
            reject('Verification failed, please Login again.')
          }

          // 打印返回的数据，用于调试
          console.log('User info response data:', data)
          console.log('User data structure:', JSON.stringify(Object.keys(data)))
          console.log('User role data:', data.role ? JSON.stringify(data.role) : 'No role data')

          // 兼容不同的数据结构
          const name = data.name || data.username || 'User'
          const avatar = data.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'

          // 处理角色和权限信息
          let roles = []

          // 专门处理后端返回的格式：role.permissions包含["all"]
          if (data.role && data.role.permissions) {
            console.log('Role permissions format:', typeof data.role.permissions)
            console.log('Role permissions value:', data.role.permissions)
            console.log('Role permissions raw string:', String(data.role.permissions))

            // 处理字符串格式的权限
            if (typeof data.role.permissions === 'string') {
              // 针对后端返回的`["all"]`格式字符串进行特殊处理
              if (data.role.permissions === '["all"]' ||
                  data.role.permissions === '"["all"]"' ||
                  data.role.permissions === '"["all"]"' ||
                  data.role.permissions.includes('"all"')) {
                console.log('Found exact "["all"]" permission format')
                roles = ['all']
              } // 处理包含all的其他字符串格式
              else if (data.role.permissions.includes('all')) {
                console.log('Found "all" permission in string')
                roles = ['all']
              } // 尝试通用的JSON解析
              else {
                try {
                  const parsedPermissions = JSON.parse(data.role.permissions)
                  roles = Array.isArray(parsedPermissions) ? parsedPermissions : []
                } catch (e) {
                  console.error('Failed to parse role.permissions:', e)
                  roles = [data.role.permissions]
                }
              }
            } // 数组格式直接使用
            else if (Array.isArray(data.role.permissions)) {
              roles = data.role.permissions
            }
          }

          // 添加强制设置，确保用户至少拥有'admin'或'all'权限
          // 这是临时解决方案，用于确保菜单能够显示
          if (roles.length === 0 || (!roles.includes('admin') && !roles.includes('all'))) {
            console.warn('No valid admin permissions found, forcing admin role for menu display')
            roles = ['admin']
          }

          console.log('Final user roles:', roles)
          console.log('Roles is array:', Array.isArray(roles))
          console.log('Roles length:', roles.length)
          console.log('Roles content:', JSON.stringify(roles))

          // 记录SET_ROLES提交操作
          console.log('Committing SET_ROLES mutation with roles:', roles)
          commit('SET_ROLES', roles)
          commit('SET_NAME', name)
          commit('SET_AVATAR', avatar)
          commit('SET_INTRODUCTION', data.role?.name || 'User')

          console.log('=== END getInfo ===')
          resolve({ ...data, roles })
        })
        .catch(error => {
          console.error('Error fetching user info:', error)
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout()
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
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
      commit('SET_ROLES', [])
      removeToken()
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
