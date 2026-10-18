import type { Offer } from '../../types/domain'
import { apiRequest, delay, useMock } from './client'
import { mapOffer, mapOffers, type OfferListPayload } from './mappers'
import { offersMock } from '../mock/platform.mock'

export async function fetchOffers(): Promise<Offer[]> {
  if (useMock) {
    await delay()
    return structuredClone(offersMock)
  }
  const payload = await apiRequest<OfferListPayload>('/offers', { auth: false })
  return mapOffers(payload)
}

export async function fetchOfferById(id: string): Promise<Offer | null> {
  if (useMock) {
    await delay()
    return structuredClone(offersMock.find((offer) => offer.id === id) ?? null)
  }
  const payload = await apiRequest<Parameters<typeof mapOffer>[0]>(`/offers/${encodeURIComponent(id)}`, { auth: false })
  return mapOffer(payload)
}
