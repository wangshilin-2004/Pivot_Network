<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useOfferStore } from './stores/offers'
import { useSessionStore } from './stores/session'
import { useConnectionStore } from './stores/connection'
import { useMock } from './services/api/client'
import { ensureAuth } from './services/api/auth'
import CheckoutDrawer from './components/CheckoutDrawer.vue'
import ToastNotification from './components/ToastNotification.vue'
import SiteNav from './components/shell/SiteNav.vue'
import SiteFooter from './components/shell/SiteFooter.vue'

const router = useRouter()
const route = useRoute()
const offers = useOfferStore()
const sessions = useSessionStore()
const connection = useConnectionStore()
const toast = ref<InstanceType<typeof ToastNotification> | null>(null)

const drawerOpen = ref(false)
const submitting = ref(false)
const algorithmId = ref(offers.algorithms[0]?.id ?? '')
const duration = ref(180)

/**
 * 真实后端模式启动引导：自动登录演示账号，并尝试恢复上一次未结束的运行时会话。
 * mock 模式直接跳过，页面使用内置数据。
 */
onMounted(async () => {
  if (useMock) return
  try {
    const user = await ensureAuth()
    await sessions.restoreActiveSession()
    connection.markConnected(user?.email ?? null)
  } catch (cause) {
    connection.markDegraded(cause)
    showToast(`后端连接失败，已回退演示数据：${cause instanceof Error ? cause.message : String(cause)}`)
  }
})

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

async function submitCheckout() {
  if (!offers.selectedOffer || submitting.value) return
  submitting.value = true
  try {
    const ok = await offers.createOrder({
      offerId: offers.selectedOffer.id,
      algorithmId: algorithmId.value,
      duration: duration.value,
    })
    if (ok) {
      drawerOpen.value = false
      showToast(useMock ? '订单创建成功，运行会话已就绪' : '订单已提交，运行时会话由平台编排完成')
      router.push('/session')
    }
  } catch (cause) {
    showToast(`下单失败：${cause instanceof Error ? cause.message : String(cause)}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="app-root">
    <a class="skip-link" href="#main">跳到主要内容</a>
    <SiteNav />

    <main id="main" class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" @open-checkout="openCheckout" />
        </Transition>
      </RouterView>
    </main>

    <SiteFooter />

    <CheckoutDrawer
      :visible="drawerOpen"
      :offer="offers.selectedOffer"
      :algorithms="offers.algorithms"
      :algorithm-id="algorithmId"
      :duration="duration"
      @close="closeCheckout"
      @update:algorithm-id="(v: string) => (algorithmId = v)"
      @update:duration="(v: number) => (duration = v)"
      @submit="submitCheckout"
    />

    <ToastNotification ref="toast" />
  </div>
</template>

<style scoped>
.app-root {
  position: relative;
  min-height: 100vh;
  background: var(--bg);
}

.app-main {
  position: relative;
  z-index: 1;
  min-height: 72vh;
}
</style>
