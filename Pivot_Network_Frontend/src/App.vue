<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterView } from 'vue-router'
import { useOfferStore } from './stores/offers'
import CheckoutDrawer from './components/CheckoutDrawer.vue'
import ToastNotification from './components/ToastNotification.vue'
import SiteNav from './components/shell/SiteNav.vue'
import SiteFooter from './components/shell/SiteFooter.vue'

const router = useRouter()
const route = useRoute()
const offers = useOfferStore()
const toast = ref<InstanceType<typeof ToastNotification> | null>(null)

const drawerOpen = ref(false)
const algorithmId = ref(offers.algorithms[0]?.id ?? '')
const duration = ref(180)

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
    showToast('订单创建成功，运行会话已就绪')
    router.push('/session')
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
