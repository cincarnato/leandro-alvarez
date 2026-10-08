import { computed, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { Coupon } from '../interfaces/PublicBenefit'

export function useCoupon(coupon: MaybeRefOrGetter<Coupon | null>) {
  const now = ref(Date.now())
  const timer = setInterval(() => { now.value = Date.now() }, 1000)
  onUnmounted(() => clearInterval(timer))
  const redeemed = computed(() => !!toValue(coupon)?.redeemedAt)
  const expired = computed(() => {
    const benefit = toValue(coupon)?.benefit
    return !!benefit && new Date(benefit.endDate).getTime() < now.value
  })
  const available = computed(() => {
    const benefit = toValue(coupon)?.benefit
    return !!benefit?.company && !redeemed.value && !expired.value && benefit.active !== false && benefit.company.active !== false && new Date(benefit.startDate).getTime() <= now.value
  })
  const status = computed(() => redeemed.value ? 'redeemed' : expired.value ? 'expired' : available.value ? 'pending' : 'unavailable')
  return { redeemed, expired, available, status }
}
