import {IdentityRoutes} from "@drax/identity-vue";
import {SettingRoutes} from "@drax/settings-vue";
import {DashboardCrudRoute} from "@drax/dashboard-vue";
import {AuditRoutes} from "@drax/audit-vue";
import {MediaRoutes} from "@drax/media-vue";
import {AiRoutes} from "@drax/ai-vue";
import {RecoveryRoutes} from "@drax/recovery-vue";


const draxRoutes = [
  ...IdentityRoutes
    .filter(route => route.name !== 'Registration')
    .map(route => {
      if (route.name === 'CrudUser') {
        return { ...route, component: () => import('../modules/base/pages/user/CustomUserCrudPage.vue') }
      }
      if (route.name === 'IdentityLogin') {
        return { ...route, component: () => import('../modules/base/pages/user/LoginPage.vue') }
      }
      return route
    }),
  ...SettingRoutes,
  ...DashboardCrudRoute,
  ...AuditRoutes,
  ...MediaRoutes,
  ...AiRoutes,
  ...RecoveryRoutes
]

export default draxRoutes
export {draxRoutes}
