
import BenefitClaimCrudPage from "../pages/crud/BenefitClaimCrudPage.vue";


const BenefitClaimCrudRoute = [
  {
    name: 'BenefitClaimCrudPage',
    path: '/crud/benefitclaim',
    component: BenefitClaimCrudPage,
    meta: {
      auth: true,
      permission: 'benefitclaim:view',
    }
  },
]

export default BenefitClaimCrudRoute
export { BenefitClaimCrudRoute }
