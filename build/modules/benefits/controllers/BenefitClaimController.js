import { AbstractFastifyController } from '@drax/crud-back';
import BenefitClaimServiceFactory from '../factory/services/BenefitClaimServiceFactory.js';
import BenefitClaimPermissions from '../permissions/BenefitClaimPermissions.js';
import { ZodErrorToValidationError } from '@drax/common-back';
import { ClaimsPaginationQuerySchema } from '../schemas/BenefitsEndpointSchema.js';
class BenefitClaimController extends AbstractFastifyController {
    constructor() {
        super(BenefitClaimServiceFactory.instance, { ...BenefitClaimPermissions, Manage: BenefitClaimPermissions.View });
        this.tenantFilter = this.tenantSetter = this.tenantAssert = false;
        this.userFilter = this.userSetter = this.userAssert = false;
        this.maximumLimit = 100;
    }
    async preRead(request, filters) {
        const result = ClaimsPaginationQuerySchema.safeParse(request.query);
        if (!result.success)
            throw ZodErrorToValidationError(result.error, request.query);
        return [...filters, ...await BenefitClaimServiceFactory.instance.scopeFilters(request.rbac)];
    }
    async postReadPaginate(_request, pagination) {
        pagination.items = pagination.items.map(claim => BenefitClaimServiceFactory.instance.coupon(claim));
        return pagination;
    }
}
export default BenefitClaimController;
export { BenefitClaimController };
