import type { Offer } from '../../types/domain'
import { useMock } from './client'
import { offersMock } from '../mock/platform.mock'

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchOffers(): Promise<Offer[]> {
  if (useMock) {
    await delay()
    return structuredClone(offersMock)
  }
  const res = await fetch('http://localhost:8000/offers')
  if (!res.ok) throw new Error(`GET /offers ${res.status}`)
  const json = await res.json()
  return json.items ?? json
}

export async function fetchOfferById(id: string): Promise<Offer | null> {
  if (useMock) {
    await delay()
    return structuredClone(offersMock.find((o) => o.id === id) ?? null)
  }
  const res = await fetch(`http://localhost:8000/offers/${id}`)
  if (!res.ok) throw new Error(`GET /offers/${id} ${res.status}`)
  return res.json()
}
