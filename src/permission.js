import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect', '/public/traceability/verify'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  console.log('=== START router beforeEach ===')
  console.log(`Navigating to: ${to.path}`)
  console.log(`From: ${from.path}`)

  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()
  console.log('Has token:', hasToken)

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      console.log('Already logged in, redirecting from login to home')
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log('Has roles in store:', hasRoles)
      console.log('Current user roles:', store.getters.roles)
      if (hasRoles) {
        // 如果有角色但没有动态路由，重新生成路由
        if (!store.state.permission.addRoutes || store.state.permission.addRoutes.length === 0) {
          console.log('No dynamic routes, generating routes based on roles...')
          try {
            // generate accessible routes map based on roles
            const accessRoutes = await store.dispatch('permission/generateRoutes', store.getters.roles)

            // dynamically add accessible routes
            router.addRoutes(accessRoutes)

            // hack method to ensure that addRoutes is complete
            // set the replace: true, so the navigation will not leave a history record
            console.log('Routes added successfully, proceeding with replace navigation to:', to.path)
            next({ ...to, replace: true })
            return
          } catch (error) {
            console.error('Error in permission guard:', error)
            // remove token and go to login page to re-login
            await store.dispatch('user/resetToken')
            Message.error(error.message || 'Has Error')
            next(`/login?redirect=${to.path}`)
            NProgress.done()
            return
          }
        }
        console.log('Proceeding to route:', to.path)
        next()
      } else {
        try {
          console.log('No roles, fetching user info...')
          // get user info and roles
          const { roles } = await store.dispatch('user/getInfo')
          console.log('Got roles from user/getInfo:', roles)

          // generate accessible routes map based on roles
          console.log('Generating routes based on roles...')
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          console.log('Generated access routes count:', accessRoutes ? accessRoutes.length : 0)

          // dynamically add accessible routes
          console.log('Adding routes to router...')
          router.addRoutes(accessRoutes)
          console.log('Routes added successfully')

          // Check if routes were actually added
          console.log('Current router routes count:', router.options.routes.length)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          console.log('Proceeding with replace navigation to:', to.path)

          // 如果当前路由是根路径，重定向到仪表板
          if (to.path === '/') {
            next({ path: '/dashboard', replace: true })
          } else {
            next({ ...to, replace: true })
          }
        } catch (error) {
          console.error('Error in permission guard:', error)
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error.message || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    console.log('No token, checking whitelist...')
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      console.log('Route in whitelist, proceeding to:', to.path)
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page
      console.log('Route not in whitelist, redirecting to login')
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
  console.log('=== END router beforeEach ===')
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
