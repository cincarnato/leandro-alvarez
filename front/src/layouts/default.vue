<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import menu from '../menu'
import {IdentityProfileAvatar, IdentityProfileDrawer, useAuth} from "@drax/identity-vue";
import {useSettingStore} from "@drax/settings-vue";
import DarkMode from "../components/DarkMode/index.vue";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.vue";
import AnimatedBackground from "../components/AnimatedBackground/AnimatedBackground.vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from 'vue-i18n';
import { useDarkMode } from '../composables/useDarkMode.js'
import NotificationButton from "../modules/base/components/NotificationButton.vue"

const {loadDarkMode} = useDarkMode()

onMounted(() => {
  loadDarkMode()
})


let profileDrawer = ref(false)
let drawer = ref(false)

const {push} = useRouter()
const settingStore = useSettingStore()

const {isAuthenticated, hasPermission} = useAuth()
const {t} = useI18n()
const route = useRoute()
const publicPage = computed(() => ['Root', 'BenefitDetail', 'PublicCoupon'].includes(String(route.name)))

const appName = computed(() => {
  return settingStore.getSettingValueByKey('AppName')
})
</script>

<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <sidebar-menu :menu="menu"></sidebar-menu>
    </v-navigation-drawer>
    <v-app-bar v-if="isAuthenticated() || publicPage" >
      <v-app-bar-nav-icon v-if="isAuthenticated()" @click="drawer=!drawer"/>
      <slot name="toolbar-left">
        <v-btn icon @click="push({name:'Root'})">
          <v-icon>mdi-home</v-icon>
        </v-btn>
       <v-app-bar-title> {{appName || t('benefitsMvp.catalog')}}</v-app-bar-title>
      </slot>
      <v-spacer></v-spacer>
      <slot name="toolbar-right"></slot>
      <dark-mode></dark-mode>
      <v-btn v-if="!isAuthenticated()" :to="{name:'Login'}">{{ t('benefitsMvp.login') }}</v-btn>
      <notification-button v-if="isAuthenticated() && hasPermission('notification:view')" class="mr-2"></notification-button>
      <identity-profile-avatar v-if="isAuthenticated()" class="cursor-pointer" @click="profileDrawer = !profileDrawer"></identity-profile-avatar>
    </v-app-bar>

    <identity-profile-drawer v-if="isAuthenticated()" v-model="profileDrawer" ></identity-profile-drawer>

    <animated-background v-if="!publicPage"></animated-background>

    <v-main>
      <router-view/>
    </v-main>

  </v-app>
</template>


