import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/overview' },
  { path: '/overview', component: () => import('../views/OverviewView.vue') },
  { path: '/marketplace', component: () => import('../views/MarketplaceView.vue') },
  { path: '/algorithms', component: () => import('../views/AlgorithmsView.vue') },
  { path: '/monitor', component: () => import('../views/MonitorView.vue') },
  { path: '/seller', component: () => import('../views/SellerConsoleView.vue') },
  { path: '/session', component: () => import('../views/SessionCenterView.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
