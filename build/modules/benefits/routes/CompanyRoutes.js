import CompanyController from "../controllers/CompanyController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { CompanySchema, CompanyBaseSchema, CompanyUserSchema, CompanyUserOptionsQuerySchema } from '../schemas/CompanySchema.js';
import { z } from 'zod';
import CompanyServiceFactory from '../factory/services/CompanyServiceFactory.js';
import CompanyPermissions from '../permissions/CompanyPermissions.js';
import BenefitsController from '../controllers/BenefitsController.js';
async function CompanyFastifyRoutes(fastify, options) {
    const controller = new CompanyController();
    const schemas = new CrudSchemaBuilder(CompanySchema, CompanyBaseSchema, CompanyBaseSchema, 'Company', 'openapi-3.0', ['benefits']);
    const actions = new BenefitsController();
    fastify.get('/api/company/user-options', { schema: {
            tags: ['benefits'],
            querystring: z.toJSONSchema(CompanyUserOptionsQuerySchema),
            response: { 200: z.toJSONSchema(z.array(CompanyUserSchema)) },
        } }, (req, rep) => actions.execute(req, rep, async () => {
        if (!req.rbac.hasPermission(CompanyPermissions.Manage) && !req.rbac.hasPermission(CompanyPermissions.Create)) {
            req.rbac.assertPermission(CompanyPermissions.Update);
        }
        const { search } = CompanyUserOptionsQuerySchema.parse(req.query);
        return CompanyServiceFactory.instance.userOptions(search);
    }));
    fastify.get('/api/company', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/company/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/company/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/company/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/company/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/company/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/company', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/company/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/company/:id', { schema: schemas.updatePartialSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/company/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/company/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/company/import', (req, rep) => controller.import(req, rep));
}
export default CompanyFastifyRoutes;
export { CompanyFastifyRoutes };
