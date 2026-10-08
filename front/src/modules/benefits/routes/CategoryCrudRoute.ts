
import CategoryCrudPage from "../pages/crud/CategoryCrudPage.vue";


const CategoryCrudRoute = [
  {
    name: 'CategoryCrudPage',
    path: '/crud/category',
    component: CategoryCrudPage,
    meta: {
      auth: true,
      permission: 'category:manage',
    }
  },
]

export default CategoryCrudRoute
export { CategoryCrudRoute }
