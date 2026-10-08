
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICategory, ICategoryBase} from '../interfaces/ICategory'

class CategoryProvider extends AbstractCrudRestProvider<ICategory, ICategoryBase, ICategoryBase> {
    
  static singleton: CategoryProvider
    
  constructor() {
   super('/api/category')
  }
  
  static get instance() {
    if(!CategoryProvider.singleton){
      CategoryProvider.singleton = new CategoryProvider()
    }
    return CategoryProvider.singleton
  }

}

export default CategoryProvider

