<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { benefitsApi, benefitsErrorKey } from '../providers/BenefitsApi'
import type { PublicBenefit, PublicCategory } from '../interfaces/PublicBenefit'
import BenefitCatalogCard from '../components/BenefitCatalogCard.vue'
import connections from '../../../assets/brand/connections.svg'
const { t } = useI18n()
const items = ref<PublicBenefit[]>([])
const sections = computed(() => {
  const featured = items.value.filter(benefit => benefit.featured)
  const other = items.value.filter(benefit => !benefit.featured)
  return [
    { key: 'featured', items: featured },
    { key: featured.length ? 'otherBenefits' : 'availableBenefits', items: other },
  ].filter(section => section.items.length)
})
const categories = ref<PublicCategory[]>([])
const category = ref<string | null>(null)
const loading = ref(false)
const error = ref('')
let request = 0
async function load() {
  const current = ++request
  loading.value = true
  error.value = ''
  try {
    const result = await benefitsApi.catalog(category.value || undefined)
    if (current === request) items.value = result.items
  } catch (e) { if (current === request) error.value = benefitsErrorKey(e) }
  finally { if (current === request) loading.value = false }
}
async function initialize() {
  try { categories.value = (await benefitsApi.categories()).items }
  catch (e) { error.value = benefitsErrorKey(e); return }
  await load()
}
watch(category, load)
onMounted(initialize)
</script>
<template>
  <v-container class="catalog-container py-8 py-md-12">
    <section class="catalog-intro mb-8" aria-labelledby="catalog-title">
      <v-row align="center">
        <v-col cols="12" md="8">
          <p class="text-overline text-secondary mb-3">{{ t('brand.catalogEyebrow') }}</p>
          <h1 id="catalog-title" class="catalog-heading mb-4">{{ t('brand.catalogTitle') }}</h1>
          <p class="text-body-1 catalog-copy mb-5">{{ t('brand.catalogIntro') }}</p>
          <v-btn :to="{ name: 'Root' }" variant="outlined" rounded="pill" append-icon="mdi-arrow-right">{{ t('brand.learn') }}</v-btn>
        </v-col>
        <v-col cols="12" md="4" class="d-none d-md-block">
          <img :src="connections" alt="" width="600" height="400" class="catalog-art" />
        </v-col>
      </v-row>
    </section>
    <v-row align="center">
      <v-col cols="12" md="8"><h2 class="text-h5">{{ t('benefitsMvp.availableBenefits') }}</h2></v-col>
      <v-col cols="12" md="4"><v-select v-model="category" :items="categories" item-title="name" item-value="_id" :label="t('benefitsMvp.allCategories')" clearable hide-details /></v-col>
    </v-row>
    <v-alert v-if="error" type="error" class="my-4">{{ t(error) }} <v-btn variant="text" @click="initialize">{{ t('benefitsMvp.retry') }}</v-btn></v-alert>
    <v-progress-linear v-if="loading" indeterminate class="my-4" :aria-label="t('benefitsMvp.catalog')" />
    <v-alert v-else-if="!items.length && !error" type="info" class="my-4">{{ t('benefitsMvp.empty') }}</v-alert>
    <template v-if="!loading">
      <section v-for="section in sections" :key="section.key" :aria-labelledby="`catalog-${section.key}`" class="mt-6">
        <h2 :id="`catalog-${section.key}`" class="text-h5 mb-4">{{ t(`benefitsMvp.${section.key}`) }}</h2>
        <v-row>
          <v-col v-for="benefit in section.items" :key="benefit._id" cols="12" sm="6" lg="4">
            <BenefitCatalogCard :benefit="benefit" />
          </v-col>
        </v-row>
      </section>
    </template>
  </v-container>
</template>
<style scoped>
.catalog-container { max-width: 1200px; }
.catalog-intro { padding: clamp(24px, 4vw, 48px); border: 1px solid rgba(var(--v-theme-on-surface), .1); border-radius: 24px; background: rgb(var(--v-theme-surface)); }
.catalog-heading { font: 400 clamp(2rem, 4vw, 3.5rem)/1.15 Georgia, serif; letter-spacing: -.035em; text-wrap: balance; }
.catalog-copy { max-width: 580px; line-height: 1.8; }
.catalog-art { display: block; width: 100%; height: auto; border-radius: 16px; }
</style>
