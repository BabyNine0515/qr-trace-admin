import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  console.log(`hasPermission check for route ${route.path || 'unknown'}`)
  console.log('User roles:', roles)
  console.log('Route has meta:', !!route.meta)
  console.log('Route has meta.roles:', route.meta ? !!route.meta.roles : false)

  if (route.meta && route.meta.roles) {
    console.log('Route allowed roles:', route.meta.roles)
    const hasRole = roles.some(role => {
      const result = route.meta.roles.includes(role)
      console.log(`  Role ${role} check result:`, result)
      return result
    })
    console.log(`Final permission check result for ${route.path || 'unknown'}:`, hasRole)
    return hasRole
  } else {
    console.log(`Route ${route.path || 'unknown'} has no roles restriction, allowing access`)
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  console.log('filterAsyncRoutes called with roles:', roles)
  console.log('filterAsyncRoutes - input routes count:', routes ? routes.length : 0)
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    const hasPerm = hasPermission(roles, tmp)
    console.log(`Route ${tmp.path} permission check result:`, hasPerm)
    if (hasPerm) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  console.log('filterAsyncRoutes - output routes count:', res.length)
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    console.log('SET_ROUTES mutation called with routes length:', routes ? routes.length : 0)
    console.log('SET_ROUTES - adding routes:', routes)
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
    console.log('SET_ROUTES - final state.routes length:', state.routes.length)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      console.log('=== START generateRoutes ===')
      let accessedRoutes

      // 打印传入的角色信息，用于调试
      console.log('generateRoutes called with roles:', roles)
      console.log('Available asyncRoutes count:', asyncRoutes ? asyncRoutes.length : 0)

      // Ensure roles is a valid array
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        console.warn('Invalid roles provided to generateRoutes:', roles)
        accessedRoutes = []
      } else {
        // 增强判断逻辑，确保正确处理'all'和'admin'权限
        console.log('Checking if user has admin or all permission...')
        console.log('Has admin role:', roles.includes('admin'))
        console.log('Has all role:', roles.includes('all'))

        if (roles.includes('admin') || roles.includes('all')) {
          console.log('User has admin or all permission, granting access to all async routes')
          accessedRoutes = asyncRoutes || []
          console.log('Accessing all async routes:', accessedRoutes.map(r => r.path))
        } else {
          console.log('Filtering routes based on user roles:', roles)
          accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
        }
      }

      // 打印最终生成的路由数量
      console.log('Generated accessed routes count:', accessedRoutes ? accessedRoutes.length : 0)
      if (accessedRoutes && accessedRoutes.length > 0) {
        console.log('Generated routes paths:', accessedRoutes.map(r => r.path))
      }

      commit('SET_ROUTES', accessedRoutes)
      console.log('=== END generateRoutes ===')
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
