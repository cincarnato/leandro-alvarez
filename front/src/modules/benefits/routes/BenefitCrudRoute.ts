
import BenefitCrudPage from "../pages/crud/BenefitCrudPage.vue";


const BenefitCrudRoute = [
  {
    name: 'BenefitCrudPage',
    path: '/crud/benefit',
    component: BenefitCrudPage,
    meta: {
      auth: true,
      permission: 'benefit:manage',
    }
  },
]

export default BenefitCrudRoute
export { BenefitCrudRoute }
