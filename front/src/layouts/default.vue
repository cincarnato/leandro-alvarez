<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IdentityProfileDrawer, useAuth } from '@drax/identity-vue'
import menu from '../menu'
import SidebarMenu from '../components/SidebarMenu/SidebarMenu.vue'
import Footer from '../components/Footer/Footer.vue'
import BrandAppBar from '../modules/brand/BrandAppBar.vue'
import { useDarkMode } from '../composables/useDarkMode'

const { t } = useI18n()
const { isAuthenticated } = useAuth()
const { loadDarkMode } = useDarkMode()
const drawer = ref(false)
const profileDrawer = ref(false)
onMounted(loadDarkMode)
</script>

<template>
  <v-app>
    <a href="#main-content" class="skip-link no-print">{{ t('brand.skip') }}</a>
    <v-navigation-drawer v-if="isAuthenticated()" v-model="drawer" temporary>
      <SidebarMenu :menu="menu" />
    </v-navigation-drawer>
    <BrandAppBar @menu="drawer = !drawer" @profile="profileDrawer = !profileDrawer" />
    <IdentityProfileDrawer v-if="isAuthenticated()" v-model="profileDrawer" />
    <v-main class="brand-main">
      <div id="main-content" class="brand-content" tabindex="-1"><router-view /></div>
      <Footer />
    </v-main>
  </v-app>
</template>

<style scoped>
.brand-main { display: flex; flex-direction: column; }
.brand-content { flex: 1 0 auto; }
.skip-link { position: fixed; top: 10px; left: 16px; z-index: 9999; padding: 12px 20px; transform: translateY(-150%); border-radius: 8px; background: rgb(var(--v-theme-primary)); color: rgb(var(--v-theme-on-primary)); }
.skip-link:focus-visible { transform: translateY(0); }
@media print { .no-print { display: none !important; } }
</style>
