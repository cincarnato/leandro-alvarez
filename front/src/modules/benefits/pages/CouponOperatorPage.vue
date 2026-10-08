<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '@drax/identity-vue'
import { useCoupon } from '../composables/useCoupon'
import { useCouponScanner } from '../composables/useCouponScanner'
import { benefitsApi, benefitsErrorKey, parseCouponToken } from '../providers/BenefitsApi'
import type { Coupon } from '../interfaces/PublicBenefit'
import CouponCard from '../components/CouponCard.vue'
const { t } = useI18n()
const { hasPermission } = useAuth()
const input = ref('')
const coupon = ref<Coupon | null>(null)
const busy = ref(false)
const error = ref('')
const success = ref(false)
const confirming = ref(false)
const { available } = useCoupon(coupon)
let generation = 0
watch(input, () => { generation++; coupon.value = null; confirming.value = false; error.value = ''; success.value = false })
const { video, scanning, starting, supported, cameraError, start, stop } = useCouponScanner(token => {
  input.value = token
  void inspect()
})
async function inspect() {
  if (busy.value) return
  stop(); confirming.value = false; coupon.value = null; success.value = false; error.value = ''
  const token = parseCouponToken(input.value)
  if (!token) { error.value = 'benefitsMvp.invalidToken'; return }
  busy.value = true
  // Let the input watcher invalidate any previous inspection before starting this one.
  await Promise.resolve()
  const current = generation
  try {
    const result = await benefitsApi.inspect(token)
    if (current === generation) coupon.value = result
  } catch (e) { if (current === generation) error.value = benefitsErrorKey(e) }
  finally { busy.value = false }
}
async function redeem() {
  if (!confirming.value || !coupon.value || busy.value || !available.value || !hasPermission('benefitclaim:redeem')) return
  const token = coupon.value.token
  const current = generation
  busy.value = true; error.value = ''; confirming.value = false
  try {
    const result = await benefitsApi.redeem(token)
    if (current === generation) { coupon.value = result; success.value = true }
  } catch (e) {
    if (current === generation) { error.value = benefitsErrorKey(e); coupon.value = null }
  } finally { busy.value = false }
}
</script>
<template>
  <v-container>
    <h1 class="text-h4 mb-4">{{ t('benefitsMvp.operator') }}</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-form @submit.prevent="inspect">
          <v-text-field v-model="input" :label="t('benefitsMvp.codeOrLink')" :disabled="busy" autocomplete="off" autocapitalize="off" spellcheck="false" clearable />
          <div class="d-flex flex-wrap ga-3">
            <v-btn type="submit" color="primary" :loading="busy" :disabled="scanning || starting">{{ t('benefitsMvp.inspect') }}</v-btn>
            <v-btn v-if="supported && !scanning" :loading="starting" :disabled="busy" variant="outlined" @click="start">{{ t('benefitsMvp.scan') }}</v-btn>
            <v-btn v-if="scanning || starting" variant="outlined" @click="stop">{{ t('benefitsMvp.stopCamera') }}</v-btn>
          </div>
        </v-form>
        <v-alert type="info" class="my-4">{{ t(supported ? 'benefitsMvp.cameraHint' : 'benefitsMvp.cameraUnavailable') }}</v-alert>
        <v-alert v-if="cameraError" type="warning" class="mb-4">{{ t(cameraError) }}</v-alert>
        <video v-if="scanning" ref="video" autoplay playsinline muted class="scanner-video" :aria-label="t('benefitsMvp.scan')" />
        <v-alert v-if="error" type="error" class="my-4">{{ t(error) }}</v-alert>
        <v-alert v-if="success" type="success" class="my-4">{{ t('benefitsMvp.success') }}</v-alert>
      </v-col>
      <v-col cols="12" md="6">
        <CouponCard v-if="coupon" :coupon="coupon">
          <v-btn v-if="hasPermission('benefitclaim:redeem')" color="primary" class="mt-4" :disabled="!available || busy" @click="confirming = true">{{ t('benefitsMvp.redeem') }}</v-btn>
        </CouponCard>
      </v-col>
    </v-row>
    <v-dialog v-model="confirming" max-width="480" :persistent="busy">
      <v-card :title="t('benefitsMvp.confirmTitle')">
        <v-card-text>{{ t('benefitsMvp.confirmText') }}<p class="mt-3">{{ coupon?.benefit?.title }} · {{ coupon?.benefit?.company?.name }}</p></v-card-text>
        <v-card-actions>
          <v-btn :disabled="busy" @click="confirming = false">{{ t('benefitsMvp.cancel') }}</v-btn>
          <v-btn color="primary" :loading="busy" :disabled="!available" @click="redeem">{{ t('benefitsMvp.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<style scoped>.scanner-video { width: 100%; max-height: 400px; border-radius: 8px; }</style>
