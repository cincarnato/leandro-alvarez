<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import CouponCard from '../components/CouponCard.vue'
import type { Coupon } from '../interfaces/PublicBenefit'
import { benefitsApi, benefitsErrorKey, parseCouponToken } from '../providers/BenefitsApi'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const coupon = ref<Coupon | null>(null)
const qr = ref('')
const loading = ref(false)
const error = ref('')
const copied = ref(false)
const refreshed = ref(false)
const link = computed(() => coupon.value ? new URL(router.resolve({ name: 'PublicCoupon', params: { token: coupon.value.token } }).href, window.location.origin).href : '')
let request = 0
async function load(showFeedback = false) {
  refreshed.value = false
  const current = ++request
  coupon.value = null; qr.value = ''; error.value = ''; copied.value = false; loading.value = false
  const token = parseCouponToken(String(route.params.token))
  if (!token) { error.value = 'benefitsMvp.invalidToken'; return }
  loading.value = true
  try {
    const result = await benefitsApi.coupon(token)
    if (current !== request) return
    coupon.value = result
    const image = await QRCode.toDataURL(link.value, { width: 320, margin: 4, errorCorrectionLevel: 'M' })
    if (current === request) { qr.value = image; refreshed.value = showFeedback }
  } catch (e) { if (current === request) error.value = benefitsErrorKey(e) }
  finally { if (current === request) loading.value = false }
}
async function copy() {
  try { await navigator.clipboard.writeText(link.value); copied.value = true }
  catch { error.value = 'benefitsMvp.errors.general' }
}
function print() { window.print() }
watch(() => route.params.token, () => load(), { immediate: true })
</script>
<template>
  <v-container class="coupon-page py-8 py-md-12">
    <v-row justify="center"><v-col cols="12" md="8" lg="6">
      <h1 class="text-h4 mb-4">{{ t('benefitsMvp.coupon') }}</h1>
      <v-alert v-if="error" type="error" class="mb-4">{{ t(error) }} <v-btn prepend-icon="mdi-refresh" variant="text" :loading="loading" @click="load(true)">{{ t('benefitsMvp.retry') }}</v-btn></v-alert>
      <v-progress-linear v-if="loading" indeterminate />
      <template v-if="coupon">
        <CouponCard :coupon="coupon">
          <div class="text-center qr-frame my-5"><p class="font-weight-medium mb-3">{{ t('benefitsMvp.qrHint') }}</p><img v-if="qr" :src="qr" :alt="t('benefitsMvp.qrHint')" width="280" height="280" class="coupon-qr" /></div>

        </CouponCard>
        <v-alert type="info" class="my-4">{{ t('benefitsMvp.privateCoupon') }}</v-alert>
        <div class="d-flex flex-wrap ga-3 no-print" aria-live="polite">
          <v-btn color="primary" :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'" @click="copy">{{ t(copied ? 'benefitsMvp.copied' : 'benefitsMvp.copy') }}</v-btn>
          <v-btn prepend-icon="mdi-download-outline" variant="outlined" :disabled="!qr" @click="print">{{ t('benefitsMvp.print') }}</v-btn>
          <v-btn prepend-icon="mdi-refresh" variant="text" :loading="loading" @click="load(true)">{{ t('benefitsMvp.refresh') }}</v-btn>
        </div>
      </template>
    </v-col></v-row>
    <v-snackbar v-model="refreshed" role="status" :timeout="3000">{{ t('benefitsMvp.refreshed') }}</v-snackbar>
  </v-container>
</template>
<style scoped>
.qr-frame { background: white; color: #0B1220; border-radius: 16px; padding: 20px 8px; border: 1px solid #dfe6ef; }
.coupon-qr { max-width: 100%; height: auto; }
</style>
<style>
@media print {
  .v-app-bar, .v-navigation-drawer, .no-print, .v-overlay-container { display: none !important; }
  .v-main { padding: 0 !important; }
  .coupon-page { max-width: 100% !important; color: black !important; }
  .coupon-page .v-col { flex: 0 0 100%; max-width: 100%; }
  .coupon-page .v-card { break-inside: avoid; background: white !important; color: black !important; }
}
</style>
