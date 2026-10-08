import CategoryServiceFactory from "../factory/services/CategoryServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import CategoryPermissions from "../permissions/CategoryPermissions.js";
class CategoryController extends AbstractFastifyController {
    constructor() {
        super(CategoryServiceFactory.instance, CategoryPermissions);
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
export { CategoryController };
