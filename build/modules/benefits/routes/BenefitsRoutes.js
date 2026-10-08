import { z } from 'zod';
import { CrudSchemaBuilder } from '@drax/crud-back';
import BenefitsController from '../controllers/BenefitsController.js';
import { BenefitBaseSchema } from '../schemas/BenefitSchema.js';
import { CouponSchema, PublicBenefitSchema, PublicCategorySchema, StatisticsSchema } from '../schemas/PublicBenefitSchema.js';
import { IdParamsSchema, TokenParamsSchema, CatalogQuerySchema } from '../schemas/BenefitsEndpointSchema.js';
import { benefitsRateLimit } from './BenefitsRateLimit.js';
import { benefitsResponseHeaders } from './BenefitsResponseHeaders.js';
const BenefitsRoutes = async (fastify) => {
    fastify.addHook('onSend', benefitsResponseHeaders);
    const controller = new BenefitsController();
    // Reuse the Drax conversion for Date -> JSON Schema date-time.
    const json = schema => new CrudSchemaBuilder(schema, BenefitBaseSchema, BenefitBaseSchema, 'Benefits', 'openapi-3.0', ['benefits']).jsonEntitySchema;
    const response = schema => ({ tags: ['benefits'], response: { 200: json(schema) } });
    const reads = benefitsRateLimit(60);
    const claims = benefitsRateLimit(10);
    const redemptions = benefitsRateLimit(30);
    fastify.get('/api/public/benefits', {
        preHandler: reads, schema: { ...response(z.object({ items: z.array(PublicBenefitSchema) })), querystring: z.toJSONSchema(CatalogQuerySchema) },
    }, async (req, rep) => {
        const result = await controller.catalog(req, rep);
        return rep.sent ? undefined : { items: result };
    });
    fastify.get('/api/public/benefits/:id', {
        preHandler: reads, schema: { ...response(PublicBenefitSchema), params: z.toJSONSchema(IdParamsSchema) },
    }, (req, rep) => controller.detail(req, rep));
    fastify.get('/api/public/categories', {
        preHandler: reads, schema: response(z.object({ items: z.array(PublicCategorySchema) })),
    }, async (req, rep) => {
        const result = await controller.categories(req, rep);
        return rep.sent ? undefined : { items: result };
    });
    fastify.post('/api/benefits/:id/claim', {
        preHandler: claims, schema: { ...response(CouponSchema), params: z.toJSONSchema(IdParamsSchema) },
    }, (req, rep) => controller.claim(req, rep));
    fastify.get('/api/public/benefit-claims/:token', {
        preHandler: reads, schema: { ...response(CouponSchema), params: z.toJSONSchema(TokenParamsSchema) },
    }, (req, rep) => controller.coupon(req, rep));
    fastify.get('/api/benefit-claims/:token/inspect', {
        schema: { ...response(CouponSchema), params: z.toJSONSchema(TokenParamsSchema) },
    }, (req, rep) => controller.inspect(req, rep));
    fastify.post('/api/benefit-claims/:token/redeem', {
        preHandler: redemptions, schema: { ...response(CouponSchema), params: z.toJSONSchema(TokenParamsSchema) },
    }, (req, rep) => controller.redeem(req, rep));
    fastify.get('/api/benefit-statistics', { schema: response(StatisticsSchema) }, (req, rep) => controller.statistics(req, rep));
};
export default BenefitsRoutes;
