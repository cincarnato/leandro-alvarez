<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { benefitsApi, benefitsErrorKey } from '../providers/BenefitsApi'
import type { PublicBenefit, PublicCategory } from '../interfaces/PublicBenefit'
import BenefitCatalogCard from '../components/BenefitCatalogCard.vue'
import { displayName, filterBenefits, isDemo } from '../utils/catalog'
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const items = ref<PublicBenefit[]>([])
const categories = ref<PublicCategory[]>([])
const loading = ref(true)
const error = ref('')
const queryValue = (key: string) => typeof route.query[key] === 'string' ? route.query[key] as string : ''
function filterModel(key: string, fallback = '') {
  return computed({ get: () => queryValue(key) || fallback, set: (value: string | null) => { router.replace({ query: { ...route.query, [key]: value || undefined } }) } })
}
const search = filterModel('q')
const category = filterModel('category')
const order = filterModel('order', 'featured')
const visible = computed(() => filterBenefits(items.value, search.value, category.value, order.value))
const demo = computed(() => items.value.some(isDemo))
const categoryOptions = computed(() => categories.value.map(item => ({ ...item, name: displayName(item.name) })))
const sorts = computed(() => ['featured', 'name', 'ending'].map(value => ({ value, title: t(`benefitsMvp.sort.${value}`) })))
async function initialize() {
  loading.value = true; error.value = ''
  try {
    const [catalog, result] = await Promise.all([benefitsApi.catalog(), benefitsApi.categories()])
    items.value = catalog.items; categories.value = result.items
  } catch (e) { error.value = benefitsErrorKey(e) }
  finally { loading.value = false }
}
function clearFilters() { router.replace({ query: {} }) }
onMounted(initialize)
</script>
<template>
  <v-container class="catalog-container py-10 py-md-16">
    <header class="catalog-intro mb-8">
      <p class="network-kicker mb-4">{{ t('brand.catalogEyebrow') }}</p>
      <h1 class="network-heading mb-5">{{ t('brand.catalogTitle') }}</h1>
      <p class="catalog-copy">{{ t('brand.catalogIntro') }}</p>
    </header>
    <v-alert v-if="demo" icon="mdi-information-outline" variant="tonal" color="primary" class="mb-6" density="compact">{{ t('benefitsMvp.demoNotice') }}</v-alert>
    <section class="network-panel pa-4 pa-md-6 mb-7" :aria-label="t('benefitsMvp.filters')">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="search" :label="t('benefitsMvp.search')" prepend-inner-icon="mdi-magnify" variant="outlined" clearable hide-details /></v-col>
        <v-col cols="12" sm="6" md="3"><v-select v-model="category" :items="categoryOptions" item-title="name" item-value="_id" :label="t('benefitsMvp.allCategories')" variant="outlined" clearable hide-details /></v-col>
        <v-col cols="12" sm="6" md="3"><v-select v-model="order" :items="sorts" :placeholder="t('benefitsMvp.sort.featured')" :label="t('benefitsMvp.order')" variant="outlined" hide-details /></v-col>
      </v-row>
    </section>
    <v-alert v-if="error" type="error" class="mb-6">{{ t(error) }} <v-btn variant="text" @click="initialize">{{ t('benefitsMvp.retry') }}</v-btn></v-alert>
    <div v-if="loading" :aria-label="t('benefitsMvp.loading')" role="status"><v-row><v-col v-for="n in 6" :key="n" cols="12" sm="6" lg="4"><v-skeleton-loader type="image, article" /></v-col></v-row></div>
    <template v-else-if="!error">
      <p class="text-body-2 mb-5" role="status" aria-live="polite">{{ t('benefitsMvp.results', { count: visible.length }) }}</p>
      <v-row v-if="visible.length">
        <v-col v-for="benefit in visible" :key="benefit._id" cols="12" sm="6" lg="4"><BenefitCatalogCard :benefit="benefit" /></v-col>
      </v-row>
      <div v-else class="network-panel text-center pa-10 pa-md-16"><v-icon icon="mdi-magnify" size="40" color="primary" class="mb-4" /><h2 class="text-h5 mb-3">{{ t('benefitsMvp.empty') }}</h2><p class="mb-6">{{ t('benefitsMvp.emptyHint') }}</p><v-btn color="primary" @click="clearFilters">{{ t('benefitsMvp.clearFilters') }}</v-btn></div>
    </template>
  </v-container>
</template>
<style scoped>
.catalog-container { max-width: 1240px; padding-inline: clamp(20px, 4vw, 48px); }
.catalog-intro { max-width: 800px; }
.catalog-copy { max-width: 650px; line-height: 1.8; font-size: 1.125rem; }
</style>
