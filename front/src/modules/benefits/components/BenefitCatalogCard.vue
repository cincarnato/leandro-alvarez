<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { PublicBenefit } from '../interfaces/PublicBenefit'
import { displayName } from '../utils/catalog'
defineProps<{ benefit: PublicBenefit }>()
const { t, locale } = useI18n()
const route = useRoute()
</script>
<template>
  <v-card class="benefit-card h-100" :class="{ 'benefit-card--featured': benefit.featured }" variant="flat" :to="{ name: 'BenefitDetail', params: { id: benefit._id }, query: route.query }">
    <div class="benefit-media">
      <v-img v-if="benefit.image" :src="benefit.image" height="220" cover loading="lazy" alt="" referrerpolicy="no-referrer" />
      <div v-else class="benefit-placeholder"><v-icon icon="mdi-storefront-outline" size="56" /></div>
      <v-chip v-if="benefit.featured" class="featured-badge" color="white" variant="flat" size="small" prepend-icon="mdi-star-four-points">{{ t('benefitsMvp.featured') }}</v-chip>
    </div>
    <div class="pa-6 d-flex flex-column flex-grow-1">
      <p class="benefit-category mb-3">{{ displayName(benefit.category?.name) }}</p>
      <h2 class="benefit-title mb-4">{{ displayName(benefit.title) }}</h2>
      <div class="d-flex align-center ga-3 mb-4"><v-avatar v-if="benefit.company?.logo" :image="benefit.company.logo" size="36" rounded="lg" /><span class="font-weight-medium">{{ displayName(benefit.company?.name) }}</span></div>
      <p class="benefit-description mb-5">{{ displayName(benefit.description) }}</p>
      <div class="benefit-bottom mt-auto pt-4"><p class="text-body-2 mb-4">{{ t('benefitsMvp.endDate') }} {{ new Date(benefit.endDate).toLocaleDateString(locale) }}</p><span class="benefit-action">{{ t('benefitsMvp.detail') }}<v-icon icon="mdi-plus" size="20" /></span></div>
    </div>
  </v-card>
</template>
<style scoped>
.benefit-card { display: flex; flex-direction: column; border: var(--network-border); border-radius: var(--network-radius); transition: transform var(--network-motion), box-shadow var(--network-motion); }
.benefit-card:hover { transform: translateY(-5px); box-shadow: var(--network-shadow); }
.benefit-card--featured { border-color: rgba(var(--v-theme-primary), .4); }
.benefit-media { position: relative; background: rgba(var(--v-theme-primary),.06); }
.benefit-placeholder { height: 220px; display: grid; place-items: center; color: rgb(var(--v-theme-primary)); }
.featured-badge { position: absolute; left: 16px; top: 16px; color: #0B1220 !important; }
.benefit-category { text-transform: uppercase; letter-spacing: .09em; font-size: .75rem; color: rgb(var(--v-theme-primary)); font-weight: 700; }
.benefit-title { font-size: 1.6rem; font-weight: 700; line-height: 1.2; letter-spacing: -.035em; }
.benefit-description { font-size: 1rem; line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.benefit-bottom { border-top: var(--network-border); }
.benefit-action { display: flex; align-items: center; justify-content: space-between; color: rgb(var(--v-theme-primary)); font-weight: 600; }
</style>
