
import CompanyCrudPage from "../pages/crud/CompanyCrudPage.vue";


const CompanyCrudRoute = [
  {
    name: 'CompanyCrudPage',
    path: '/crud/company',
    component: CompanyCrudPage,
    meta: {
      auth: true,
      permission: 'company:manage',
    }
  },
]

export default CompanyCrudRoute
export { CompanyCrudRoute }
