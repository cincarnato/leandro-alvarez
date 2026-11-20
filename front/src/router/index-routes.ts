import {createRouter, createWebHistory} from 'vue-router'

import {setupLayouts} from 'virtual:generated-layouts'
import draxRoutes from './drax-routes'
import modulesRoutes from './modules-routes'


const routes = setupLayouts([
  ...draxRoutes,
  ...modulesRoutes
])


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 96 }
    // Keep the catalog position when only its search or filters change.
    if (to.path === from.path && to.hash === from.hash && to.fullPath !== from.fullPath) return false
    return { left: 0, top: 0 }
  },
})

import {useAuth} from "@drax/identity-vue";

router.beforeEach((to) => {
  const {isAuthenticated, hasPermission} = useAuth()
  if ( !['Login'].includes(to.name as string) && (to.meta.auth && !isAuthenticated()) || (to.meta.permission && !hasPermission(to.meta.permission as string))) {
    return {path: '/login', query: {redirect: to.fullPath}}
  }
})

export default router
