<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import BrandMark from '../../modules/brand/BrandMark.vue'
import { brand } from '../../modules/brand/brand'
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <v-footer class="brand-footer no-print pa-0" :app="false">
    <v-container class="py-10 py-md-14">
      <v-row class="mb-6" justify="space-between">
        <v-col cols="12" md="5">
          <BrandMark inverse />
          <p class="footer-essence mt-6 mb-3">{{ t('brand.essence') }}.</p>
          <p class="footer-copy mb-0">{{ t('brand.footerNote') }}</p>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <h2 class="text-subtitle-2 mb-4">{{ t('brand.network') }}</h2>
          <nav class="d-flex flex-column align-start ga-3" :aria-label="t('brand.network')">
            <router-link :to="{ name: 'Root' }">{{ t('brand.about') }}</router-link>
            <router-link :to="{ name: 'Catalog' }">{{ t('brand.catalog') }}</router-link>
            <router-link :to="{ name: 'Login' }">{{ t('brand.operator') }}</router-link>
          </nav>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <h2 class="text-subtitle-2 mb-4">{{ t('brand.contact') }}</h2>
          <div class="d-flex flex-column align-start ga-3">
            <a :href="brand.phoneHref"><v-icon icon="mdi-phone-outline" size="18" class="mr-2" aria-hidden="true" />{{ brand.phone }}</a>
            <a :href="brand.whatsappHref"><v-icon icon="mdi-whatsapp" size="18" class="mr-2" aria-hidden="true" />{{ t('brand.whatsapp') }}</a>
            <a :href="brand.instagramHref" target="_blank" rel="noopener noreferrer"><v-icon icon="mdi-instagram" size="18" class="mr-2" aria-hidden="true" />{{ t('brand.instagram') }}</a>
          </div>
        </v-col>
      </v-row>
      <div class="footer-bottom d-flex flex-wrap justify-space-between ga-3 pt-5">
        <small>© {{ year }} {{ t('brand.rights') }}</small>
        <small>{{ t('brand.termsHint') }}</small>
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped>
.brand-footer { background: rgb(var(--v-theme-brand-ink)); color: rgb(var(--v-theme-brand-sand)); flex: 0 0 auto; }
.brand-footer .v-container { max-width: 1200px; }
.footer-essence { font: 25px/1.4 Georgia, serif; }
.footer-copy { max-width: 360px; line-height: 1.8; opacity: .8; }
.brand-footer a { color: inherit; text-decoration: none; font-size: 14px; line-height: 1.6; }
.brand-footer a:hover { text-decoration: underline; text-underline-offset: 4px; }
.brand-footer a:focus-visible { outline: 2px solid rgb(var(--v-theme-brand-sand)); outline-offset: 5px; }
.footer-bottom { border-top: 1px solid rgba(var(--v-theme-brand-sand), .2); }
.footer-bottom small { opacity: .8; line-height: 1.7; }
</style>
