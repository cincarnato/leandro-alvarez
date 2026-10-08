<script setup lang="ts">
import { IdentityLogin } from '@drax/identity-vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import BrandMark from '../../../brand/BrandMark.vue'
import { brand } from '../../../brand/brand'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
function onLoginSuccess() {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  router.push(redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/')
}
</script>

<template>
  <v-container class="py-12">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="9" md="6" lg="5">
        <v-card class="pa-6 pa-sm-10" variant="flat" border>
          <div class="d-flex justify-center mb-6"><BrandMark /></div>
          <div class="text-center mb-6">
            <v-avatar size="88" class="mb-4"><v-img :src="brand.portrait" :alt="t('brand.portraitAlt')" /></v-avatar>
            <h1 class="login-title mb-3">{{ t('brand.loginTitle') }}</h1>
            <p class="text-body-2 text-medium-emphasis">{{ t('brand.loginIntro') }}</p>
          </div>
          <IdentityLogin @login-success="onLoginSuccess" recovery />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-title { font: 400 clamp(1.8rem, 4vw, 2.4rem)/1.2 Georgia, serif; letter-spacing: -.03em; }
</style>
