<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BenefitClaimProvider from '../../providers/BenefitClaimProvider'
import { benefitsErrorKey } from '../../providers/BenefitsApi'
import type { Coupon } from '../../interfaces/PublicBenefit'
import CouponCard from '../CouponCard.vue'
const { t, locale } = useI18n()
const items = ref<Coupon[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const pendingOnly = ref(false)
const loading = ref(false)
const error = ref('')
const selected = ref<Coupon | null>(null)
let generation = 0
async function load() {
  const current = ++generation
  loading.value = true; error.value = ''
  try {
    const result = await BenefitClaimProvider.instance.paginate({ page: page.value, limit: limit.value, status: pendingOnly.value ? 'pending' : '' })
    if (current === generation) { items.value = result.items; total.value = result.total }
  } catch (e) { if (current === generation) { error.value = benefitsErrorKey(e); items.value = []; total.value = 0 } }
  finally { if (current === generation) loading.value = false }
}
function reset() { page.value = 1; void load() }
onMounted(load)
</script>
<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12" md="8"><h1 class="text-h4">{{ t('benefitsMvp.coupons') }}</h1></v-col>
      <v-col cols="12" md="4"><v-btn :loading="loading" @click="load">{{ t('benefitsMvp.refresh') }}</v-btn></v-col>
    </v-row>
    <v-row align="center">
      <v-col cols="12" sm="6"><v-checkbox v-model="pendingOnly" :label="t('benefitsMvp.pending')" hide-details @update:model-value="reset" /></v-col>
      <v-col cols="12" sm="6"><v-select v-model="limit" :items="[10, 25, 50, 100]" :label="t('benefitsMvp.rowsPerPage')" hide-details @update:model-value="reset" /></v-col>
    </v-row>
    <v-alert v-if="error" type="error" class="my-4">{{ t(error) }}</v-alert>
    <v-table class="mt-4" :aria-label="t('benefitsMvp.coupons')">
      <thead><tr><th>{{ t('benefitsMvp.benefit') }}</th><th>{{ t('benefitsMvp.company') }}</th><th>{{ t('benefitsMvp.token') }}</th><th>{{ t('benefitsMvp.createdAt') }}</th><th>{{ t('benefitsMvp.redeemedAt') }}</th><th>{{ t('benefitsMvp.inspect') }}</th></tr></thead>
      <tbody>
        <tr v-for="item in items" :key="item.token">
          <td>{{ item.benefit?.title || t('benefitsMvp.missingBenefit') }}</td><td>{{ item.benefit?.company?.name || '—' }}</td>
          <td class="token-cell">{{ item.token }}</td><td>{{ new Date(item.createdAt).toLocaleString(locale) }}</td>
          <td>{{ item.redeemedAt ? new Date(item.redeemedAt).toLocaleString(locale) : t('benefitsMvp.pending') }}</td>
          <td><v-btn variant="text" @click="selected = item">{{ t('benefitsMvp.inspect') }}</v-btn></td>
        </tr>
      </tbody>
    </v-table>
    <v-progress-linear v-if="loading" indeterminate />
    <v-alert v-else-if="!items.length && !error" type="info" class="my-4">{{ t('benefitsMvp.empty') }}</v-alert>
    <v-pagination v-model="page" :length="Math.ceil(total / limit)" :disabled="loading" @update:model-value="load" />
    <v-dialog :model-value="!!selected" max-width="650" @update:model-value="selected = null"><CouponCard v-if="selected" :coupon="selected"><v-btn variant="text" class="mt-4" @click="selected = null">{{ t('benefitsMvp.cancel') }}</v-btn></CouponCard></v-dialog>
  </v-container>
</template>
<style scoped>.token-cell { min-width: 180px; max-width: 280px; overflow-wrap: anywhere; font-family: monospace; }</style>
