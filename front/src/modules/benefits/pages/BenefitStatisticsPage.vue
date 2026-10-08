<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { benefitsApi, benefitsErrorKey } from '../providers/BenefitsApi'
import type { BenefitStatistics } from '../interfaces/PublicBenefit'
const { t } = useI18n()
const totals = ref<BenefitStatistics | null>(null)
const loading = ref(false)
const error = ref('')
const rate = computed(() => totals.value?.claims ? (100 * totals.value.redeemed / totals.value.claims).toFixed(1) + '%' : '0%')
let generation = 0
async function load() {
  if (loading.value) return
  const current = ++generation
  loading.value = true; error.value = ''; totals.value = null
  try {
    const result = await benefitsApi.statistics()
    if (current === generation) totals.value = result
  } catch (e) { if (current === generation) error.value = benefitsErrorKey(e) }
  finally { if (current === generation) loading.value = false }
}
onMounted(load)
onUnmounted(() => { generation++ })
</script>
<template>
  <v-container>
    <div class="d-flex flex-wrap align-center ga-4 mb-4"><h1 class="text-h4">{{ t('benefitsMvp.statistics') }}</h1><v-btn :loading="loading" @click="load">{{ t('benefitsMvp.refresh') }}</v-btn></div>
    <v-alert v-if="error" type="error" class="mb-4">{{ t(error) }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate class="mb-4" />
    <v-row v-if="totals">
      <v-col v-for="metric in ['claims', 'redeemed', 'pending', 'rate'] as const" :key="metric" cols="12" sm="6" md="3">
        <v-card variant="outlined"><v-card-title>{{ t(`benefitsMvp.${metric}`) }}</v-card-title><v-card-text class="text-h4">{{ metric === 'rate' ? rate : totals[metric] }}</v-card-text></v-card>
      </v-col>
    </v-row>
    <template v-if="totals">
      <v-alert type="info" class="my-4">{{ t('benefitsMvp.breakdownNote') }}</v-alert>
      <v-row>
        <v-col v-for="section in [{ key: 'byBenefit', items: totals.byBenefit }, { key: 'byCompany', items: totals.byCompany }]" :key="section.key" cols="12" lg="6">
          <v-card variant="outlined"><v-card-title>{{ t(`benefitsMvp.${section.key}`) }}</v-card-title>
            <v-table><thead><tr><th>{{ t(`benefitsMvp.${section.key === 'byBenefit' ? 'benefit' : 'company'}`) }}</th><th>{{ t('benefitsMvp.claims') }}</th><th>{{ t('benefitsMvp.redeemed') }}</th><th>{{ t('benefitsMvp.pending') }}</th></tr></thead>
              <tbody><tr v-for="item in section.items" :key="item.id"><td>{{ item.name || t('benefitsMvp.missingBenefit') }}</td><td>{{ item.generated }}</td><td>{{ item.redeemed }}</td><td>{{ item.generated - item.redeemed }}</td></tr></tbody>
            </v-table><v-card-text v-if="!section.items.length && !loading">{{ t('benefitsMvp.empty') }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
