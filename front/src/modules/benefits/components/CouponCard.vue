<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCoupon } from '../composables/useCoupon'
import type { Coupon } from '../interfaces/PublicBenefit'
import { displayName } from '../utils/catalog'
const props = defineProps<{ coupon: Coupon }>()
const { t, locale } = useI18n()
const { status, redeemed, expired } = useCoupon(() => props.coupon)
const date = (value: string) => new Date(value).toLocaleString(locale.value)
</script>
<template>
  <v-card variant="flat" class="network-panel coupon-card pa-2 pa-sm-4">
    <v-card-title class="text-wrap">{{ displayName(coupon.benefit?.title) || t('benefitsMvp.missingBenefit') }}</v-card-title>
    <v-card-subtitle class="text-wrap">{{ displayName(coupon.benefit?.company?.name) || t('benefitsMvp.missingBenefit') }}</v-card-subtitle>
    <v-card-text>
      <v-chip :color="status === 'pending' ? 'success' : 'warning'" class="mb-3">{{ t(`benefitsMvp.${status}`) }}</v-chip>
      <v-chip v-if="redeemed && expired" color="warning" class="mb-3 ml-2">{{ t('benefitsMvp.expired') }}</v-chip>
      <slot />
      <details class="my-4 no-print"><summary>{{ t('benefitsMvp.technicalCode') }}</summary><span class="coupon-code d-block mt-2">{{ coupon.token }}</span></details>
      <p>{{ t('benefitsMvp.createdAt') }}: {{ date(coupon.createdAt) }}</p>
      <p v-if="coupon.benefit">{{ t('benefitsMvp.endDate') }}: {{ date(coupon.benefit.endDate) }}</p>
      <p v-if="coupon.redeemedAt">{{ t('benefitsMvp.redeemedAt') }}: {{ date(coupon.redeemedAt) }}</p>
      <h3 class="text-subtitle-1 mt-4">{{ t('benefitsMvp.conditions') }}</h3>
      <p class="conditions">{{ coupon.benefit?.conditions || t('benefitsMvp.missingBenefit') }}</p>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.coupon-code { overflow-wrap: anywhere; font-family: monospace; }
.conditions { white-space: pre-wrap; line-height: 1.7; }
summary { cursor: pointer; padding-block: 10px; font-size: .875rem; }
.coupon-card :deep(.v-card-title) { font-weight: 700; font-size: 1.6rem; line-height: 1.3; }
</style>
