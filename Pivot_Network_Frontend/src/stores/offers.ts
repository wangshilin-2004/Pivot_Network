import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { algorithmsMock, sellerDraftsMock } from '../services/mock/platform.mock'
import type { AlgorithmTemplate, Offer, SellerDraft } from '../types/domain'
import { fetchOffers } from '../services/api/offers'
import { useSessionStore } from './session'

export const useOfferStore = defineStore('offers', () => {
  const offers = ref<Offer[]>([])
  const algorithms = ref<AlgorithmTemplate[]>(structuredClone(algorithmsMock))
  const sellerDrafts = ref<SellerDraft[]>(structuredClone(sellerDraftsMock))
  const selectedOfferId = ref<string | null>(null)
  const loading = ref(true)

  const selectedOffer = computed(() => offers.value.find((o) => o.id === selectedOfferId.value) ?? null)

  async function loadOffers() {
    loading.value = true
    try {
      offers.value = await fetchOffers()
    } finally {
      loading.value = false
    }
  }

  function selectOffer(id: string) { selectedOfferId.value = id }
  function clearSelection() { selectedOfferId.value = null }

  function createOrder(payload: { offerId: string; algorithmId: string; duration: number }) {
    const offer = offers.value.find((item) => item.id === payload.offerId)
    const algorithm = algorithms.value.find((item) => item.id === payload.algorithmId)
    if (!offer || !algorithm) return false

    const session = useSessionStore()
    session.createSession(offer, algorithm, payload.duration)
    return true
  }

  function publishOffer(payload: { title: string; region: string; gpu: string; cpu: string; memory: string; price: number; image: string }) {
    const newOffer: Offer = {
      id: `offer-${Date.now().toString().slice(-5)}`,
      title: payload.title,
      region: payload.region,
      seller: 'seller_new_user',
      price: payload.price,
      unit: '元/小时',
      gpu: payload.gpu,
      cpu: payload.cpu,
      memory: payload.memory,
      status: '待审核',
      runtimeImage: payload.image,
      inventory: '新发布资源',
      latency: '待探测',
      tags: ['新上架', '卖家资源'],
    }
    offers.value.unshift(newOffer)
    sellerDrafts.value.unshift({
      title: payload.title,
      status: '待审核',
      gpu: payload.gpu,
      price: `${payload.price} 元/小时`,
    })
  }

  // 初始化加载
  loadOffers()

  return {
    offers, algorithms, sellerDrafts, selectedOfferId, selectedOffer, loading,
    loadOffers, selectOffer, clearSelection, createOrder, publishOffer,
  }
})
