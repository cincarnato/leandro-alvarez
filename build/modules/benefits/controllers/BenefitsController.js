import { ZodError } from 'zod';
import { ZodErrorToValidationError } from '@drax/common-back';
import BenefitServiceFactory from '../factory/services/BenefitServiceFactory.js';
import BenefitClaimServiceFactory from '../factory/services/BenefitClaimServiceFactory.js';
import CategoryServiceFactory from '../factory/services/CategoryServiceFactory.js';
import { ObjectIdSchema } from '../schemas/BenefitSchema.js';
import { TokenParamsSchema, CatalogQuerySchema } from '../schemas/BenefitsEndpointSchema.js';
import { PublicBenefitSchema, PublicCategorySchema } from '../schemas/PublicBenefitSchema.js';
import BenefitClaimPermissions from '../permissions/BenefitClaimPermissions.js';
import BenefitsPermissions from '../permissions/BenefitsPermissions.js';
class BenefitsController {
    async execute(request, reply, action) {
        try {
            return await action();
        }
        catch (error) {
            if (error instanceof ZodError)
                error = ZodErrorToValidationError(error, request.body ?? request.params);
            if (error?.statusCode && error?.body)
                return reply.code(error.statusCode).send(error.body);
            // Error messages, stacks and Mongo keyValue can contain bearer coupon tokens.
            const safeNames = ['Error', 'TypeError', 'RangeError', 'MongoServerError', 'MongooseError', 'CastError'];
            const errorName = safeNames.includes(error?.name) ? error.name : 'Error';
            request.log.error({ message: 'Unexpected benefits error', errorName });
            return reply.code(500).send({ error: 'error.server' });
        }
    }
    catalog(request, reply) {
        return this.execute(request, reply, () => {
            const { category } = CatalogQuerySchema.parse(request.query);
            return BenefitServiceFactory.instance.catalog(category);
        });
    }
    detail(request, reply) {
        return this.execute(request, reply, async () => PublicBenefitSchema.parse(await BenefitServiceFactory.instance.available(ObjectIdSchema.parse(request.params.id))));
    }
    categories(request, reply) {
        return this.execute(request, reply, async () => (await CategoryServiceFactory.instance.find({ orderBy: 'name', order: 'asc' }))
            .map(category => PublicCategorySchema.parse(category)));
    }
    claim(request, reply) {
        return this.execute(request, reply, () => BenefitClaimServiceFactory.instance.issue(ObjectIdSchema.parse(request.params.id)));
    }
    coupon(request, reply) {
        return this.execute(request, reply, async () => BenefitClaimServiceFactory.instance.coupon(await BenefitClaimServiceFactory.instance.byToken(TokenParamsSchema.parse(request.params).token)));
    }
    inspect(request, reply) {
        return this.execute(request, reply, async () => {
            request.rbac.assertPermission(BenefitClaimPermissions.View);
            return BenefitClaimServiceFactory.instance.coupon(await BenefitClaimServiceFactory.instance.inspect(TokenParamsSchema.parse(request.params).token, request.rbac));
        });
    }
    redeem(request, reply) {
        return this.execute(request, reply, async () => {
            request.rbac.assertPermission(BenefitClaimPermissions.Redeem);
            return BenefitClaimServiceFactory.instance.redeem(TokenParamsSchema.parse(request.params).token, request.rbac);
        });
    }
    statistics(request, reply) {
        return this.execute(request, reply, () => {
            request.rbac.assertPermission(BenefitsPermissions.Statistics);
            return BenefitClaimServiceFactory.instance.statistics(request.rbac);
        });
    }
}
export default BenefitsController;
