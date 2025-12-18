// src/router/index.ts
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

// 导入页面组件（懒加载，保持原有优势）
const Home = () => import('@/views/Home.vue')
const Album = () => import('@/views/Album.vue')
const Template = () => import('@/views/Template.vue')
const Filters = () => import('@/views/Filters.vue') // 命名与组件文件一致
const My = () => import('@/views/My.vue')
const AR = () => import('@/views/AR.vue')
// 404页面（保留并使用）
const NotFound = () => import('@/views/NotFound.vue')

const router = createRouter({
  // 优化：开发环境用 history 模式，生产环境用 hash 模式（解决打包后本地预览空白）
  history: import.meta.env.DEV
    ? createWebHistory(import.meta.env.BASE_URL)
    : createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        showTabbar: false, // 修正注释与值的矛盾，根据实际需求调整为 true/false
        title: '主页',
      },
    },
    {
      path: '/album',
      name: 'Album',
      component: Album,
      meta: {
        showTabbar: false,
        title: '相册',
      },
    },
    {
      path: '/template',
      name: 'Template',
      component: Template,
      meta: {
        showTabbar: false,
        title: '模板选择',
      },
    },
    {
      path: '/my',
      name: 'My',
      component: My,
      meta: {
        showTabbar: true,
        title: '我的',
      },
    },
    {
      path: '/filter', // URL 路径保持小写
      name: 'Filters', // 路由名称与组件文件名一致（Filters.vue）
      component: Filters,
      meta: { // 补充 meta 字段，保持逻辑统一
        showTabbar: false, // 根据实际需求调整
        title: '滤镜',
      },
    },
    {
      path: '/ar', // URL 路径改为小写（符合 URL 规范）
      name: 'AR', // 组件名是 AR.vue，名称保持大写没问题
      component: AR,
      meta: { // 补充 meta 字段
        showTabbar: false,
        title: 'AR效果',
      },
    },
    // 新增：404 路由（必须放在最后，匹配所有未定义的路径）
    {
      path: '/:pathMatch(.*)*', // 匹配所有路径（Vue Router 4 写法）
      name: 'NotFound',
      component: NotFound,
      meta: {
        showTabbar: false,
        title: '页面不存在',
      },
    },
  ],
})

export default router
