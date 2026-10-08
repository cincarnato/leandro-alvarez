import type {FastifyPluginAsync} from 'fastify';
import {CrudSchemaBuilder} from '@drax/crud-back';
import BenefitClaimController from '../controllers/BenefitClaimController.js';
import {BenefitClaimBaseSchema} from '../schemas/BenefitClaimSchema.js';
import {CouponSchema} from '../schemas/PublicBenefitSchema.js';
import {benefitsResponseHeaders} from './BenefitsResponseHeaders.js';

const BenefitClaimFastifyRoutes: FastifyPluginAsync = async fastify => {
    fastify.addHook('onSend', benefitsResponseHeaders);
    const controller = new BenefitClaimController();
    const schemas = new CrudSchemaBuilder(CouponSchema, BenefitClaimBaseSchema, BenefitClaimBaseSchema, 'BenefitClaim', 'openapi-3.0', ['benefits']);
    // Deliberately no generic reads, exports, imports or mutations.
    fastify.get('/api/benefit-claims', {schema: schemas.paginateSchema}, (req, rep) => controller.paginate(req as any, rep));
};
export default BenefitClaimFastifyRoutes;
export {BenefitClaimFastifyRoutes};
