
import CompanyCrudRoute from "./CompanyCrudRoute"
import CategoryCrudRoute from "./CategoryCrudRoute"
import BenefitCrudRoute from "./BenefitCrudRoute"
import BenefitClaimCrudRoute from "./BenefitClaimCrudRoute"

export const routes = [
    ...CompanyCrudRoute,
...CategoryCrudRoute,
...BenefitCrudRoute,
...BenefitClaimCrudRoute,
    { name: 'BenefitDetail', path: '/benefits/:id', component: () => import('../pages/BenefitDetailPage.vue'), meta: { auth: false } },
    { name: 'PublicCoupon', path: '/coupons/:token', component: () => import('../pages/PublicCouponPage.vue'), meta: { auth: false } },
    { name: 'CouponOperator', path: '/operator/coupons', component: () => import('../pages/CouponOperatorPage.vue'), meta: { auth: true, permission: 'benefitclaim:view' } },
    { name: 'BenefitStatistics', path: '/benefits/statistics/overview', component: () => import('../pages/BenefitStatisticsPage.vue'), meta: { auth: true, permission: 'benefits:statistics' } },
]

export default routes
