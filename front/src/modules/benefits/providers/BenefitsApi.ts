import { HttpRestClientFactory } from '@drax/common-front'
import type { BenefitStatistics, Coupon, PublicBenefit, PublicCategory } from '../interfaces/PublicBenefit'

export class BenefitsApiError extends Error {
  constructor(public status: number) { super('Benefits request failed') }
}

// Drax's installed transport logs request URLs on failure. Reuse its base URL/auth
// headers, but never pass coupon URLs through that logger or persist responses.
export async function benefitsRequest<T>(path: string, method: 'GET' | 'POST' = 'GET', publicRequest = false): Promise<T> {
  const client = HttpRestClientFactory.getInstance()
  const headers = { ...client.getBaseHeaders() }
  if (publicRequest) {
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase() === 'authorization') delete headers[key]
    }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(client.baseUrl + path, {
      method, headers, signal: controller.signal, cache: 'no-store', referrerPolicy: 'no-referrer',
    })
    if (!response.ok) throw new BenefitsApiError(response.status)
    return await response.json() as T
  } catch (error) {
    if (error instanceof BenefitsApiError) throw error
    throw new BenefitsApiError(0)
  } finally { clearTimeout(timeout) }
}

export const benefitsApi = {
  categories: () => benefitsRequest<{ items: PublicCategory[] }>('/api/public/categories', 'GET', true),
  catalog: (category?: string) => benefitsRequest<{ items: PublicBenefit[] }>('/api/public/benefits' + (category ? `?category=${encodeURIComponent(category)}` : ''), 'GET', true),
  detail: (id: string) => benefitsRequest<PublicBenefit>(`/api/public/benefits/${encodeURIComponent(id)}`, 'GET', true),
  claim: (id: string) => benefitsRequest<Coupon>(`/api/benefits/${encodeURIComponent(id)}/claim`, 'POST', true),
  coupon: (token: string) => benefitsRequest<Coupon>(`/api/public/benefit-claims/${encodeURIComponent(token)}`, 'GET', true),
  inspect: (token: string) => benefitsRequest<Coupon>(`/api/benefit-claims/${encodeURIComponent(token)}/inspect`),
  redeem: (token: string) => benefitsRequest<Coupon>(`/api/benefit-claims/${encodeURIComponent(token)}/redeem`, 'POST'),
  statistics: () => benefitsRequest<BenefitStatistics>('/api/benefit-statistics'),
}

export function benefitsErrorKey(error: unknown): string {
  const status = error instanceof BenefitsApiError ? error.status : 0
  return `benefitsMvp.errors.${[400, 401, 403, 404, 422, 429].includes(status) ? status : 'general'}`
}

export function parseCouponToken(input: string): string | null {
  const value = input.trim()
  if (/^[a-f0-9]{64}$/i.test(value)) return value
  try {
    const url = new URL(value)
    if (url.origin !== window.location.origin || url.search || url.hash) return null
    return url.pathname.match(/\/coupons\/([a-f0-9]{64})\/?$/i)?.[1] ?? null
  } catch { return null }
}
