
import type {ICategory, ICategoryBase} from './ICategory'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICategoryRepository extends IDraxCrudRepository<ICategory, ICategoryBase, ICategoryBase>{

}

export {ICategoryRepository}


