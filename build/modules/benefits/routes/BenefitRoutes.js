import BenefitController from "../controllers/BenefitController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { BenefitSchema, BenefitBaseSchema } from '../schemas/BenefitSchema.js';
async function BenefitFastifyRoutes(fastify, options) {
    const controller = new BenefitController();
    const schemas = new CrudSchemaBuilder(BenefitSchema, BenefitBaseSchema, BenefitBaseSchema, 'Benefit', 'openapi-3.0', ['benefits']);
    fastify.get('/api/benefit', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/benefit/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/benefit/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/benefit/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/benefit/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/benefit/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/benefit', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/benefit/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/benefit/:id', { schema: schemas.updatePartialSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/benefit/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/benefit/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/benefit/import', (req, rep) => controller.import(req, rep));
}
export default BenefitFastifyRoutes;
export { BenefitFastifyRoutes };
