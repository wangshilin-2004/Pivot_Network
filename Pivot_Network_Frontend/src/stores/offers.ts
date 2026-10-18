import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useMock } from '../services/api/client'
import { fetchOffers } from '../services/api/offers'
import { algorithmsMock, offersMock, sellerDraftsMock } from '../services/mock/platform.mock'
import type { AlgorithmTemplate, Offer, SellerDraft } from '../types/domain'
import { useConnectionStore } from './connection'
import { useSessionStore } from './session'

export interface CreateOrderPayload {
  offerId: string
  algorithmId: string
  duration: number
}

export const useOfferStore = defineStore('offers', () => {
  const offers = ref<Offer[]>([])
  const algorithms = ref<AlgorithmTemplate[]>(structuredClone(algorithmsMock))
  const sellerDrafts = ref<SellerDraft[]>(structuredClone(sellerDraftsMock))
  const selectedOfferId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selectedOffer = computed(() => offers.value.find((offer) => offer.id === selectedOfferId.value) ?? null)

  async function loadOffers(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      offers.value = await fetchOffers()
      if (!useMock) useConnectionStore().markConnected()
    } catch (cause) {
      // 后端不可用时回退到本地演示数据，保证页面仍可展示完整业务链路
      error.value = cause instanceof Error ? cause.message : String(cause)
      useConnectionStore().markDegraded(cause)
      offers.value = structuredClone(offersMock)
    } finally {
      loading.value = false
    }
  }

  function selectOffer(offerId: string): void {
    selectedOfferId.value = offerId
  }

  function clearSelection(): void {
    selectedOfferId.value = null
  }

  /**
   * 下单：mock 模式由 session store 本地编排；真实模式走
   * 订单 → 激活 → 兑换授权码 → RuntimeSession 的完整后端链路。
   */
  async function createOrder(payload: CreateOrderPayload): Promise<boolean> {
    const offer = offers.value.find((item) => item.id === payload.offerId) ?? selectedOffer.value
    if (!offer) throw new Error('未找到所选资源，请刷新后重试')
    const algorithm = algorithms.value.find((item) => item.id === payload.algorithmId) ?? algorithms.value[0]
    if (!algorithm) throw new Error('未找到算法模板')

    loading.value = true
    try {
      await useSessionStore().createSession(offer, algorithm, payload.duration)
      return true
    } finally {
      loading.value = false
    }
  }

  function publishOffer(draft: {
    title: string
    region: string
    gpu: string
    cpu: string
    memory: string
    price: number
    runtimeImage?: string
    image?: string
    tags?: string[]
  }): void {
    const runtimeImage = draft.runtimeImage ?? draft.image ?? 'pytorch:2.3-cuda12'
    const tags = draft.tags?.length ? draft.tags : [draft.gpu, draft.region]
    const sellerDraft: SellerDraft = {
      title: draft.title,
      status: '待审核',
      gpu: draft.gpu,
      price: `${draft.price} 元/小时`,
    }
    sellerDrafts.value.unshift(sellerDraft)
    offers.value.unshift({
      id: `offer-local-${Date.now().toString().slice(-6)}`,
      title: draft.title,
      region: draft.region,
      seller: '当前卖家',
      price: draft.price,
      unit: '元/小时',
      gpu: draft.gpu,
      cpu: draft.cpu,
      memory: draft.memory,
      status: '待审核',
      runtimeImage,
      inventory: '库存待确认',
      latency: '待探测',
      tags,
    })
  }

  loadOffers()

  return {
    offers,
    algorithms,
    sellerDrafts,
    selectedOfferId,
    loading,
    error,
    selectedOffer,
    loadOffers,
    selectOffer,
    clearSelection,
    createOrder,
    publishOffer,
  }
})
