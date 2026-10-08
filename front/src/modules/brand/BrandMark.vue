<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { brand } from './brand'
defineProps<{ inverse?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <router-link :to="{ name: 'LeandroLanding' }" class="brand-mark" :class="{ 'brand-mark--inverse': inverse }" :aria-label="`${brand.name} · ${t('brand.network')}`">
    <span class="brand-monogram" aria-hidden="true">{{ brand.initials }}<span /></span>
    <span class="brand-wordmark">
      <span class="brand-name">{{ brand.name }}</span>
      <span class="brand-descriptor">{{ t('brand.network') }}</span>
    </span>
  </router-link>
</template>

<style scoped>
.brand-mark { display: inline-flex; align-items: center; gap: 12px; color: rgb(var(--v-theme-on-surface)); text-decoration: none; flex-shrink: 0; }
.brand-monogram { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px 14px 14px 3px; background: rgb(var(--v-theme-brand-ink)); color: rgb(var(--v-theme-brand-sand)); font: 22px Georgia, serif; letter-spacing: -2px; }
.brand-monogram span { position: absolute; top: 7px; right: 7px; width: 5px; height: 5px; border-radius: 50%; background: rgb(var(--v-theme-brand-terracotta)); }
.brand-wordmark { display: flex; flex-direction: column; gap: 3px; }
.brand-name { font-family: Georgia, serif; font-size: 19px; line-height: 1.1; }
.brand-descriptor { text-transform: uppercase; letter-spacing: .15em; font-size: 9px; line-height: 1.4; font-weight: 600; }
.brand-mark--inverse { color: rgb(var(--v-theme-brand-sand)); }
.brand-mark--inverse .brand-monogram { border: 1px solid rgba(var(--v-theme-brand-sand), .3); }
.brand-mark:focus-visible { outline: 2px solid rgb(var(--v-theme-secondary)); outline-offset: 6px; border-radius: 4px; }
@media (max-width: 380px) { .brand-name { font-size: 16px; } .brand-mark { gap: 8px; } .brand-monogram { width: 36px; height: 40px; } }
</style>
