<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PublicBenefit } from '../interfaces/PublicBenefit'
defineProps<{ benefit: PublicBenefit }>()
const { t, locale } = useI18n()
</script>
<template>
  <v-card height="100%" variant="outlined">
    <v-img v-if="benefit.image" :src="benefit.image" max-height="250px"   referrerpolicy="no-referrer" />
    <v-card-title class="text-wrap">{{ benefit.title }}</v-card-title>
    <v-card-subtitle class="text-wrap">{{ benefit.company?.name }} · {{ benefit.category?.name }}</v-card-subtitle>
    <v-card-text>
      <v-chip v-if="benefit.featured" color="primary" size="small" prepend-icon="mdi-star" class="mb-3">{{ t('benefitsMvp.featured') }}</v-chip>
      <p>{{ benefit.description }}</p>
      <p class="mt-3">{{ t('benefitsMvp.endDate') }}: {{ new Date(benefit.endDate).toLocaleDateString(locale) }}</p>
    </v-card-text>
    <v-card-actions><v-btn color="primary" :to="{ name: 'BenefitDetail', params: { id: benefit._id } }">{{ t('benefitsMvp.detail') }}</v-btn></v-card-actions>
  </v-card>
</template>
