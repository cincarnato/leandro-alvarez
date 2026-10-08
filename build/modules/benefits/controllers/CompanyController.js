import CompanyServiceFactory from "../factory/services/CompanyServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import CompanyPermissions from "../permissions/CompanyPermissions.js";
class CompanyController extends AbstractFastifyController {
    constructor() {
        super(CompanyServiceFactory.instance, CompanyPermissions);
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
export default CompanyController;
export { CompanyController };
