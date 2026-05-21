<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import { navItems } from './services/mock/platform.mock'
import { useOfferStore } from './stores/offers'
import { useSessionStore } from './stores/session'
import { useMonitorStore } from './stores/monitor'
import CheckoutDrawer from './components/CheckoutDrawer.vue'
import ToastNotification from './components/ToastNotification.vue'

const router = useRouter()
const route = useRoute()
const offers = useOfferStore()
const session = useSessionStore()
const monitor = useMonitorStore()
const toast = ref<InstanceType<typeof ToastNotification> | null>(null)

const drawerOpen = ref(false)
const algorithmId = ref(offers.algorithms[0]?.id ?? '')
const duration = ref(180)

const currentTab = computed(() => route.path.replace('/', '') || 'overview')
const pageTitle = computed(() => navItems.find((item) => item.id === currentTab.value)?.title ?? '平台总览')

function showToast(msg: string) {
  toast.value?.show(msg)
}

function openCheckout(offerId: string) {
  offers.selectOffer(offerId)
  algorithmId.value = offers.algorithms[0]?.id ?? ''
  duration.value = 180
  drawerOpen.value = true
}

function closeCheckout() {
  drawerOpen.value = false
  offers.clearSelection()
}

function submitCheckout() {
  if (!offers.selectedOffer) return
  const ok = offers.createOrder({
    offerId: offers.selectedOffer.id,
    algorithmId: algorithmId.value,
    duration: duration.value,
  })
  if (ok) {
    drawerOpen.value = false
    showToast('订单创建成功')
    router.push('/session')
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">P</div>
        <div>
          <div class="brand-title">Pivot Network</div>
          <div class="brand-subtitle">算力资源交易与运行平台</div>
        </div>
      </div>

      <nav class="nav">
        <button
          v-for="(item, index) in navItems"
          :key="item.id"
          class="nav-button"
          :class="{ active: currentTab === item.id }"
          @click="router.push(`/${item.id}`)"
        >
          <span class="nav-label">
            <span class="nav-title">{{ item.title }}</span>
            <span class="nav-subtitle">{{ item.subtitle }}</span>
          </span>
          <span class="nav-index">0{{ index + 1 }}</span>
        </button>
      </nav>

      <div class="sidebar-card compact-card">
        <div class="sidebar-label">平台状态</div>
        <div class="sidebar-highlight">{{ session.session.status }}</div>
        <p class="sidebar-text">
          {{ session.session.status === '运行中' ? '活跃会话已就绪' : '当前会话已暂停' }}
        </p>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <h1>{{ pageTitle }}</h1>
        <div class="topbar-actions">
          <button class="ghost-button" @click="router.push('/marketplace')">选购资源</button>
          <button class="primary-button" @click="router.push('/session')">当前会话</button>
        </div>
      </header>

      <section class="hero-panel compact-hero">
        <div class="hero-copy">
          <h2>选择合适算力，快速启动你的任务。</h2>
          <details class="inline-explainer">
            <summary>查看说明</summary>
            <p>你可以在这里完成资源选购、算法匹配、会话创建、运行状态查看，以及卖家资源发布等核心操作。</p>
          </details>
          <div class="hero-actions">
            <button class="primary-button" @click="router.push('/marketplace')">浏览资源</button>
            <button class="secondary-button" @click="router.push('/monitor')">查看监控</button>
          </div>
        </div>

        <div class="hero-grid">
          <div class="metric-tile"><span>在线节点</span><strong>{{ monitor.summary.onlineNodes }}</strong></div>
          <div class="metric-tile"><span>可售资源</span><strong>{{ offers.offers.length }}</strong></div>
          <div class="metric-tile"><span>活跃会话</span><strong>{{ session.session.status === '运行中' ? 1 : 0 }}</strong></div>
          <div class="metric-tile accent"><span>GPU 利用率</span><strong>{{ monitor.summary.avgGpuUsage }}%</strong></div>
        </div>
      </section>

      <section class="page-content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" @open-checkout="openCheckout" />
          </Transition>
        </RouterView>
      </section>
    </main>

    <CheckoutDrawer
      :visible="drawerOpen"
      :offer="offers.selectedOffer"
      :algorithms="offers.algorithms"
      :algorithm-id="algorithmId"
      :duration="duration"
      @close="closeCheckout"
      @update:algorithm-id="(v: string) => algorithmId = v"
      @update:duration="(v: number) => duration = v"
      @submit="submitCheckout"
    />

    <ToastNotification ref="toast" />
  </div>
</template>
