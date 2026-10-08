
import CategoryServiceFactory from "../factory/services/CategoryServiceFactory.js";
import {AbstractFastifyController} from "@drax/crud-back";
import CategoryPermissions from "../permissions/CategoryPermissions.js";
import type {ICategory, ICategoryBase} from "../interfaces/ICategory";

class CategoryController extends AbstractFastifyController<ICategory, ICategoryBase, ICategoryBase>   {

    constructor() {
        super(CategoryServiceFactory.instance, CategoryPermissions)
        this.tenantField = "tenant";
        this.userField = "user";
        
        this.tenantFilter = false;
        this.tenantSetter = false;
        this.tenantAssert = false;
        
        this.userFilter = false;
        this.userSetter = false;
        this.userAssert = false;
    }

}

export default CategoryController;
export {
    CategoryController
}

