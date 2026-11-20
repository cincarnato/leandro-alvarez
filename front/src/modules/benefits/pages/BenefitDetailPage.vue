<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { PublicBenefit } from '../interfaces/PublicBenefit'
import { benefitsApi, benefitsErrorKey } from '../providers/BenefitsApi'
import { displayName, isDemo } from '../utils/catalog'
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const benefit = ref<PublicBenefit | null>(null)
const loading = ref(false)
const claiming = ref(false)
const error = ref('')
let request = 0
async function load() {
  const current = ++request
  loading.value = true; error.value = ''; benefit.value = null
  try { const result = await benefitsApi.detail(String(route.params.id)); if (current === request) benefit.value = result }
  catch (e) { if (current === request) error.value = benefitsErrorKey(e) }
  finally { if (current === request) loading.value = false }
}
async function claim() {
  if (!benefit.value || claiming.value) return
  claiming.value = true; error.value = ''
  try {
    const coupon = await benefitsApi.claim(benefit.value._id)
    await router.push({ name: 'PublicCoupon', params: { token: coupon.token } })
  } catch (e) { error.value = benefitsErrorKey(e) }
  finally { claiming.value = false }
}
watch(() => route.params.id, load, { immediate: true })
</script>
<template>
  <v-container class="detail-page py-8 py-md-12">
    <v-btn :to="{ name: 'Catalog', query: route.query }" variant="text" class="mb-4">{{ t('benefitsMvp.back') }}</v-btn>
    <v-alert v-if="error" type="error" class="mb-4">{{ t(error) }} <v-btn v-if="!benefit" variant="text" @click="load">{{ t('benefitsMvp.retry') }}</v-btn></v-alert>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-if="benefit && isDemo(benefit)" variant="tonal" color="primary" class="mb-6">{{ t('benefitsMvp.demoNotice') }}</v-alert>
    <v-row v-if="benefit" class="network-panel pa-2 pa-md-6">
      <v-col cols="12" md="6"><v-img v-if="benefit.image" :src="benefit.image" height="460" cover rounded="xl" referrerpolicy="no-referrer" /></v-col>
      <v-col cols="12" md="6">
        <h1 class="network-heading detail-title mb-5">{{ displayName(benefit.title) }}</h1>
        <div class="d-flex align-center ga-3 mb-4"><v-avatar v-if="benefit.company?.logo" :image="benefit.company.logo" /><span class="text-h6">{{ displayName(benefit.company?.name) }}</span></div>
        <v-chip v-if="benefit.category" class="mb-3">{{ displayName(benefit.category.name) }}</v-chip>
        <p class="text-body-1 mb-4 description">{{ benefit.description }}</p>
        <p>{{ t('benefitsMvp.endDate') }}: {{ new Date(benefit.endDate).toLocaleString(locale) }}</p>
        <h2 class="text-h6 mt-4">{{ t('benefitsMvp.conditions') }}</h2><p class="description">{{ benefit.conditions }}</p>
        <v-btn color="primary" size="large" class="mt-6 claim-button" prepend-icon="mdi-ticket-percent-outline" :loading="claiming" :disabled="claiming" @click="claim">{{ t('benefitsMvp.claim') }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.detail-page { max-width: 1240px; }
.detail-title { font-size: clamp(2rem, 3.5vw, 3.4rem); }
.description { white-space: pre-wrap; line-height: 1.8; }
.claim-button { min-height: 52px; width: 100%; }
@media (max-width: 599px) { .detail-page :deep(.v-img) { height: 280px !important; } }
</style>
