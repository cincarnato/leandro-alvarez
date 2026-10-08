import BenefitServiceFactory from "../factory/services/BenefitServiceFactory.js";
import { AbstractFastifyController } from "@drax/crud-back";
import BenefitPermissions from "../permissions/BenefitPermissions.js";
class BenefitController extends AbstractFastifyController {
    constructor() {
        super(BenefitServiceFactory.instance, BenefitPermissions);
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
export default BenefitController;
export { BenefitController };
