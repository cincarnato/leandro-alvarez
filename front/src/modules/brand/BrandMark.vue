<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { brand } from './brand'
defineProps<{ inverse?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <router-link :to="{ name: 'Root' }" class="brand-mark" :class="{ 'brand-mark--inverse': inverse }" :aria-label="`${brand.name} · ${t('brand.network')}`">
    <span class="brand-monogram" aria-hidden="true">{{ brand.initials }}<span /></span>
    <span class="brand-wordmark">
      <span class="brand-name">{{ brand.name }}</span>
      <span class="brand-descriptor">{{ t('brand.network') }}</span>
    </span>
  </router-link>
</template>

<style scoped>
.brand-mark { display: inline-flex; align-items: center; gap: 12px; color: inherit; text-decoration: none; flex-shrink: 0; }
.brand-monogram { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: var(--network-navy); color: var(--network-ice); font: 700 20px var(--network-font); letter-spacing: -1px; }
.brand-monogram span { position: absolute; top: 7px; right: 7px; width: 5px; height: 5px; border-radius: 50%; background: var(--network-cyan); }
.brand-wordmark { display: flex; flex-direction: column; gap: 3px; }
.brand-name { font-family: var(--network-font); font-weight: 600; font-size: 19px; line-height: 1.1; }
.brand-descriptor { text-transform: uppercase; letter-spacing: .15em; font-size: 11px; line-height: 1.4; font-weight: 600; }
.brand-mark--inverse { color: var(--network-ice); }
.brand-mark--inverse .brand-monogram { border: 1px solid #f6f8fc4d; }
.brand-mark:focus-visible { outline: 2px solid rgb(var(--v-theme-secondary)); outline-offset: 6px; border-radius: 4px; }
@media (max-width: 380px) { .brand-name { font-size: 16px; } .brand-mark { gap: 8px; } .brand-monogram { width: 36px; height: 40px; } }
</style>
