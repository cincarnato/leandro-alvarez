<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const value = defineModel<string>()
const { t } = useI18n()
</script>
<template>
  <v-text-field :model-value="value" :label="t('benefitsMvp.token')" readonly />
</template>
