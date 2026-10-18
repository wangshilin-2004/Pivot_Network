import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/LandingView.vue'),
    meta: { title: '让算力像水电一样流动 · Pivot Network' },
  },
  {
    path: '/overview',
    component: () => import('../views/OverviewView.vue'),
    meta: { title: '平台总览 · Pivot Network' },
  },
  {
    path: '/marketplace',
    component: () => import('../views/MarketplaceView.vue'),
    meta: { title: '资源市场 · Pivot Network' },
  },
  {
    path: '/algorithms',
    component: () => import('../views/AlgorithmsView.vue'),
    meta: { title: '算法工坊 · Pivot Network' },
  },
  {
    path: '/monitor',
    component: () => import('../views/MonitorView.vue'),
    meta: { title: '监控中心 · Pivot Network' },
  },
  {
    path: '/seller',
    component: () => import('../views/SellerConsoleView.vue'),
    meta: { title: '卖家控制台 · Pivot Network' },
  },
  {
    path: '/session',
    component: () => import('../views/SessionCenterView.vue'),
    meta: { title: '会话中心 · Pivot Network' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 72, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})
