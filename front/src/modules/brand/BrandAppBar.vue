<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuth, IdentityProfileAvatar } from '@drax/identity-vue'
import { useDarkMode } from '../../composables/useDarkMode'
import NotificationButton from '../base/components/NotificationButton.vue'
import BrandMark from './BrandMark.vue'
import { brand } from './brand'

defineEmits<{ menu: []; profile: [] }>()
const { t } = useI18n()
const { isAuthenticated, hasPermission } = useAuth()
const { darkMode } = useDarkMode()
</script>

<template>
  <v-app-bar color="toolbar" :elevation="0" height="88" class="brand-app-bar no-print">
    <div class="bar-content px-3 px-sm-6">
      <v-btn v-if="isAuthenticated()" icon="mdi-menu" variant="text" :aria-label="t('brand.menu')" class="mr-2" @click="$emit('menu')" />
      <BrandMark />
      <v-spacer />
      <nav class="d-none d-md-flex align-center ga-1" :aria-label="t('brand.network')">
        <v-btn :to="{ name: 'Root' }" variant="text" rounded="pill" exact>{{ t('brand.about') }}</v-btn>
        <v-btn :to="{ name: 'Catalog' }" variant="text" rounded="pill" exact>{{ t('brand.catalog') }}</v-btn>
      </nav>
      <v-btn :href="brand.whatsappHref" icon="mdi-whatsapp" variant="text" class="d-none d-sm-flex ml-2" :aria-label="t('brand.whatsapp')" />
      <v-btn :icon="darkMode ? 'mdi-weather-sunny' : 'mdi-weather-night'" variant="text" :aria-label="t(darkMode ? 'brand.themeLight' : 'brand.themeDark')" :title="t(darkMode ? 'brand.themeLight' : 'brand.themeDark')" @click="darkMode = !darkMode" />
      <template v-if="isAuthenticated()">
        <NotificationButton v-if="hasPermission('notification:view')" class="d-none d-sm-flex" />
        <IdentityProfileAvatar class="cursor-pointer ml-1" @click="$emit('profile')" />
      </template>
      <v-btn v-else :to="{ name: 'Login' }" variant="outlined" rounded="pill" size="small" class="d-none d-lg-flex ml-3">{{ t('brand.operator') }}</v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" class="d-md-none" :aria-label="t('brand.menu')" />
        </template>
        <v-list>
          <v-list-item :to="{ name: 'Root' }" :title="t('brand.about')" prepend-icon="mdi-account-outline" />
          <v-list-item :to="{ name: 'Catalog' }" :title="t('brand.catalog')" prepend-icon="mdi-gift-outline" />
          <v-list-item :href="brand.whatsappHref" :title="t('brand.whatsapp')" prepend-icon="mdi-whatsapp" />
          <v-list-item v-if="!isAuthenticated()" :to="{ name: 'Login' }" :title="t('brand.operator')" prepend-icon="mdi-lock-outline" />
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>
</template>

<style scoped>
.brand-app-bar { border-bottom: 1px solid rgba(var(--v-theme-on-surface), .1); }
.brand-app-bar::after { content: ''; position: absolute; bottom: 0; left: 0; width: 112px; height: 3px; background: rgb(var(--v-theme-brand-terracotta)); }
.bar-content { display: flex; align-items: center; width: 100%; max-width: 1440px; margin-inline: auto; }
@media (max-width: 380px) { .bar-content { padding-inline: 8px !important; } .bar-content :deep(.v-btn--icon) { width: 36px; } }
</style>
