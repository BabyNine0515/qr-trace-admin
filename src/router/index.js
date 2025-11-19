import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// 暂时移除所有模块路由，后续根据需求添加
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  // 公开的溯源码验证页面
  {
    path: '/public/traceability/verify',
    component: () => import('@/views/traceability/verify'),
    name: 'PublicTraceabilityVerify',
    hidden: true
  },
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/dashboard',
  //   children: [
  //     {
  //       path: 'dashboard',
  //       component: () => import('@/views/dashboard/index'),
  //       name: 'Dashboard',
  //       meta: { title: '数据分析', icon: 'dashboard', affix: true }
  //     }
  //   ]
  // },
  // 根路径重定向到产品列表
  {
    path: '/',
    component: Layout,
    redirect: '/product/list'
  },
  // {
  //   path: '/documentation',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/documentation/index'),
  //       name: 'Documentation',
  //       meta: { title: '文档', icon: 'documentation', affix: true }
  //     }
  //   ]
  // },
  // {
  //   path: '/guide',
  //   component: Layout,
  //   redirect: '/guide/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/guide/index'),
  //       name: 'Guide',
  //       meta: { title: '指南', icon: 'guide', noCache: true }
  //     }
  //   ]
  // },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人资料', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 官网管理作为父菜单栏
  {
    path: '/website',
    component: Layout,
    redirect: '/website/home',
    alwaysShow: true,
    name: 'Website',
    meta: {
      title: '官网管理',
      icon: 'el-icon-globe',
      roles: ['admin', 'editor']
    },
    children: [
      // 首页配置
      {
        path: 'home',
        component: () => import('@/views/website/home'),
        name: 'WebsiteHome',
        meta: {
          title: '首页配置',
          icon: 'el-icon-s-home'
        }
      },
      // 新闻管理
      {
        path: 'news',
        component: () => import('@/views/website/news'),
        name: 'WebsiteNews',
        meta: {
          title: '新闻管理',
          icon: 'el-icon-document'
        }
      },
      // 产品展示配置
      {
        path: 'products-show',
        component: () => import('@/views/website/products-show'),
        name: 'WebsiteProductsShow',
        meta: {
          title: '产品展示配置',
          icon: 'el-icon-s-grid'
        }
      },
      // 联系我们配置
      {
        path: 'contact',
        component: () => import('@/views/website/contact'),
        name: 'WebsiteContact',
        meta: {
          title: '联系我们配置',
          icon: 'el-icon-phone'
        }
      }
    ]
  },
  // 溯源码管理
  {
    path: '/traceability',
    component: Layout,
    redirect: '/traceability/qrcode',
    alwaysShow: true,
    name: 'Traceability',
    meta: {
      title: '溯源码管理',
      icon: 'el-icon-shield',
      roles: ['admin', 'editor']
    },
    children: [
      // 溯源码二维码管理
      {
        path: 'qrcode',
        component: () => import('@/views/traceability/qrcode'),
        name: 'TraceabilityQRCode',
        meta: {
          title: '溯源码二维码',
          icon: 'el-icon-qrcode'
        }
      }
    ]
  },

  // 产品管理 - 作为独立顶级菜单
  {
    path: '/product',
    component: Layout,
    redirect: '/product/list',
    alwaysShow: true,
    name: 'Product',
    meta: {
      title: '产品管理',
      icon: 'el-icon-goods',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/product/list'),
        name: 'ProductList',
        meta: {
          title: '产品列表',
          icon: 'el-icon-s-order'
        }
      },
      {
        path: 'edit',
        component: () => import('@/views/product/edit'),
        name: 'ProductEdit',
        meta: {
          title: '产品详情编辑',
          icon: 'el-icon-edit'
        }
      },
      {
        path: 'status',
        component: () => import('@/views/product/status'),
        name: 'ProductStatus',
        meta: {
          title: '产品发布/下架管理',
          icon: 'el-icon-switch-button'
        }
      }
    ]
  },

  // 媒体资源管理 - 作为独立顶级菜单
  {
    path: '/media',
    component: Layout,
    redirect: '/media/image',
    alwaysShow: true,
    name: 'Media',
    meta: {
      title: '媒体资源管理',
      icon: 'el-icon-picture',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'image',
        component: () => import('@/views/media/image'),
        name: 'ImageLibrary',
        meta: {
          title: '图片库管理',
          icon: 'el-icon-image'
        }
      },
      {
        path: 'video',
        component: () => import('@/views/media/video'),
        name: 'VideoLibrary',
        meta: {
          title: '视频库管理',
          icon: 'el-icon-video-play'
        }
      },
      {
        path: 'upload',
        component: () => import('@/views/media/upload'),
        name: 'MediaUpload',
        meta: {
          title: '媒体文件上传',
          icon: 'el-icon-upload'
        }
      }
    ]
  },

  // 公司信息管理 - 作为独立顶级菜单
  {
    path: '/company',
    component: Layout,
    redirect: '/company/basic-info',
    alwaysShow: true,
    name: 'Company',
    meta: {
      title: '公司信息管理',
      icon: 'el-icon-office-building',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'basic-info',
        component: () => import('@/views/company/basic-info.vue'),
        name: 'CompanyBasic',
        meta: {
          title: '公司基本信息',
          icon: 'el-icon-info'
        }
      },
      {
        path: 'qualifications',
        component: () => import('@/views/company/qualifications.vue'),
        name: 'CompanyQualification',
        meta: {
          title: '公司资质管理',
          icon: 'el-icon-certificate'
        }
      },
      {
        path: 'promotion-media',
        component: () => import('@/views/company/promotion-media.vue'),
        name: 'CompanyPromotion',
        meta: {
          title: '公司宣传媒体',
          icon: 'el-icon-guide'
        }
      }
    ]
  },

  // 生产信息管理 - 作为独立顶级菜单
  {
    path: '/production',
    component: Layout,
    redirect: '/production/upstream-info',
    alwaysShow: true,
    name: 'Production',
    meta: {
      title: '生产信息管理',
      icon: 'el-icon-factory',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'upstream-info',
        component: () => import('@/views/production/upstream-info.vue'),
        name: 'UpstreamInfo',
        meta: {
          title: '上游生产信息',
          icon: 'el-icon-link'
        }
      },
      {
        path: 'factory-management',
        component: () => import('@/views/production/factory-management.vue'),
        name: 'FactoryManagement',
        meta: {
          title: '生产厂家管理',
          icon: 'el-icon-management'
        }
      }
    ]
  },

  // 质量信息管理 - 作为独立顶级菜单
  {
    path: '/quality',
    component: Layout,
    redirect: '/quality/report-management',
    alwaysShow: true,
    name: 'Quality',
    meta: {
      title: '质量信息管理',
      icon: 'el-icon-quality',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'report-management',
        component: () => import('@/views/quality/report-management.vue'),
        name: 'QualityReport',
        meta: {
          title: '检验报告管理',
          icon: 'el-icon-document'
        }
      }
    ]
  },

  // 评论互动管理 - 作为独立顶级菜单
  {
    path: '/comment',
    component: Layout,
    redirect: '/comment/comment-list',
    alwaysShow: true,
    name: 'Comment',
    meta: {
      title: '评论互动管理',
      icon: 'el-icon-message',
      roles: ['admin', 'editor']
    },
    children: [
      {
        path: 'comment-list',
        component: () => import('@/views/comment/comment-list.vue'),
        name: 'CommentList',
        meta: {
          title: '评论列表',
          icon: 'el-icon-s-order'
        }
      },
      {
        path: 'comment-approval',
        component: () => import('@/views/comment/comment-approval.vue'),
        name: 'CommentApproval',
        meta: {
          title: '评论审核',
          icon: 'el-icon-check'
        }
      }
    ]
  },

  // 系统设置 - 作为独立顶级菜单
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    alwaysShow: true,
    name: 'System',
    meta: {
      title: '系统设置',
      icon: 'el-icon-setting',
      roles: ['admin']
    },
    children: [
      {
        path: 'user',
        component: () => import('@/views/system/user'),
        name: 'UserPermission',
        meta: {
          title: '用户权限管理',
          icon: 'el-icon-user'
        }
      },
      {
        path: 'config',
        component: () => import('@/views/system/config'),
        name: 'SystemConfig',
        meta: {
          title: '系统配置',
          icon: 'el-icon-s-tools'
        }
      }
    ]
  },
  // 暂时移除权限管理菜单，后续根据需求添加
  // {
  //   path: '/permission',
  //   component: Layout,
  //   redirect: '/permission/page',
  //   alwaysShow: true, // will always show the root menu
  //   name: 'Permission',
  //   meta: {
  //     title: '权限',
  //     icon: 'lock',
  //     roles: ['admin', 'editor'] // you can set roles in root nav
  //   },
  //   children: [
  //     {
  //       path: 'page',
  //       component: () => import('@/views/permission/page'),
  //       name: 'PagePermission',
  //       meta: {
  //         title: '页面权限',
  //         roles: ['admin'] // or you can only set roles in sub nav
  //       }
  //     },
  //     {
  //       path: 'directive',
  //       component: () => import('@/views/permission/directive'),
  //       name: 'DirectivePermission',
  //       meta: {
  //         title: '指令权限'
  //         // if do not set roles, means: this page does not require permission
  //       }
  //     },
  //     {
  //       path: 'role',
  //       component: () => import('@/views/permission/role'),
  //       name: 'RolePermission',
  //       meta: {
  //         title: '角色权限',
  //         roles: ['admin']
  //       }
  //     }
  //   ]
  // },

  // {
  //   path: '/icon',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/icons/index'),
  //       name: 'Icons',
  //       meta: { title: '图标', icon: 'icon', noCache: true }
  //     }
  //   ]
  // },

  /** when your routing map is too long, you can split it into small modules **/
  // 暂时移除所有模块路由，后续根据需求添加
  // componentsRouter,
  // chartsRouter,
  // nestedRouter,
  // tableRouter,

  // {
  //   path: '/example',
  //   component: Layout,
  //   redirect: '/example/list',
  //   name: 'Example',
  //   meta: {
  //     title: '示例',
  //     icon: 'el-icon-s-help'
  //   },
  //   children: [
  //     {
  //       path: 'create',
  //       component: () => import('@/views/example/create'),
  //       name: 'CreateArticle',
  //       meta: { title: '创建文档', icon: 'edit' }
  //     },
  //     {
  //       path: 'edit/:id(\\d+)',
  //       component: () => import('@/views/example/edit'),
  //       name: 'EditArticle',
  //       meta: { title: '编辑文章', noCache: true, activeMenu: '/example/list' },
  //       hidden: true
  //     },
  //     {
  //       path: 'list',
  //       component: () => import('@/views/example/list'),
  //       name: 'ArticleList',
  //       meta: { title: '文章列表', icon: 'list' }
  //     }
  //   ]
  // },

  // {
  //   path: '/tab',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/tab/index'),
  //       name: 'Tab',
  //       meta: { title: 'Tab', icon: 'tab' }
  //     }
  //   ]
  // },

  // {
  //   path: '/error',
  //   component: Layout,
  //   redirect: 'noRedirect',
  //   name: 'ErrorPages',
  //   meta: {
  //     title: '错误页面',
  //     icon: '404'
  //   },
  //   children: [
  //     {
  //       path: '401',
  //       component: () => import('@/views/error-page/401'),
  //       name: 'Page401',
  //       meta: { title: '401', noCache: true }
  //     },
  //     {
  //       path: '404',
  //       component: () => import('@/views/error-page/404'),
  //       name: 'Page404',
  //       meta: { title: '404', noCache: true }
  //     }
  //   ]
  // },

  // {
  //   path: '/error-log',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'log',
  //       component: () => import('@/views/error-log/index'),
  //       name: 'ErrorLog',
  //       meta: { title: '错误日志', icon: 'bug' }
  //     }
  //   ]
  // },

  // {
  //   path: '/excel',
  //   component: Layout,
  //   redirect: '/excel/export-excel',
  //   name: 'Excel',
  //   meta: {
  //     title: 'Excel',
  //     icon: 'excel'
  //   },
  //   children: [
  //     {
  //       path: 'export-excel',
  //       component: () => import('@/views/excel/export-excel'),
  //       name: 'ExportExcel',
  //       meta: { title: '导出 Excel' }
  //     },
  //     {
  //       path: 'export-selected-excel',
  //       component: () => import('@/views/excel/select-excel'),
  //       name: 'SelectExcel',
  //       meta: { title: '导出选定内容' }
  //     },
  //     {
  //       path: 'export-merge-header',
  //       component: () => import('@/views/excel/merge-header'),
  //       name: 'MergeHeader',
  //       meta: { title: 'Merge Header' }
  //     },
  //     {
  //       path: 'upload-excel',
  //       component: () => import('@/views/excel/upload-excel'),
  //       name: 'UploadExcel',
  //       meta: { title: '上传 Excel' }
  //     }
  //   ]
  // },

  // {
  //   path: '/zip',
  //   component: Layout,
  //   redirect: '/zip/download',
  //   alwaysShow: true,
  //   name: 'Zip',
  //   meta: { title: 'Zip', icon: 'zip' },
  //   children: [
  //     {
  //       path: 'download',
  //       component: () => import('@/views/zip/index'),
  //       name: 'ExportZip',
  //       meta: { title: '导出 Zip' }
  //     }
  //   ]
  // },

  // {
  //   path: '/pdf',
  //   component: Layout,
  //   redirect: '/pdf/index',
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/pdf/index'),
  //       name: 'PDF',
  //       meta: { title: 'PDF', icon: 'pdf' }
  //     }
  //   ]
  // },
  // 暂时移除PDF下载页面，后续根据需求添加
  // {
  //   path: '/pdf/download',
  //   component: () => import('@/views/pdf/download'),
  //   hidden: true
  // },

  // {
  //   path: '/theme',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/theme/index'),
  //       name: 'Theme',
  //       meta: { title: '主题', icon: 'theme' }
  //     }
  //   ]
  // },

  // {
  //   path: '/clipboard',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/clipboard/index'),
  //       name: 'ClipboardDemo',
  //       meta: { title: '剪贴板', icon: 'clipboard' }
  //     }
  //   ]
  // },

  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://github.com/PanJiaChen/vue-element-admin',
  //       meta: { title: 'External Link', icon: 'link' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
