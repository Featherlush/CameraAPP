// src/router/index.ts (或 .js)
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件（推荐使用懒加载）
const Home = () => import('@/views/Home.vue')
const Album = () => import('@/views/Album.vue')
const Template = () => import('@/views/Template.vue')

const Filter = () =>import('@/views/Filters.vue')
const My = () => import('@/views/My.vue')

const AR = () => import('@/views/AR.vue')
// 可选：添加404页面
const NotFound = () => import('@/views/NotFound.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        showTabbar: false, // 显示Tabbar
        title: '主页', // 页面标题
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
      path:'/filter',
      name:'Filter',
      component:Filter
    },
    {
      path:'/AR',
      name:'AR',
      component:AR
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
      meta: {
        showTabbar: false,
      },
    },
  ],
})

// 可选：全局前置守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - CameraAPP'
  }
  next()
})

export default router
