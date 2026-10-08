import CategoryController from "../controllers/CategoryController.js";
import { CrudSchemaBuilder } from "@drax/crud-back";
import { CategorySchema, CategoryBaseSchema } from '../schemas/CategorySchema.js';
async function CategoryFastifyRoutes(fastify, options) {
    const controller = new CategoryController();
    const schemas = new CrudSchemaBuilder(CategorySchema, CategoryBaseSchema, CategoryBaseSchema, 'Category', 'openapi-3.0', ['benefits']);
    fastify.get('/api/category', { schema: schemas.paginateSchema }, (req, rep) => controller.paginate(req, rep));
    fastify.get('/api/category/find', { schema: schemas.findSchema }, (req, rep) => controller.find(req, rep));
    fastify.get('/api/category/search', { schema: schemas.searchSchema }, (req, rep) => controller.search(req, rep));
    fastify.get('/api/category/:id', { schema: schemas.findByIdSchema }, (req, rep) => controller.findById(req, rep));
    fastify.get('/api/category/find-one', { schema: schemas.findOneSchema }, (req, rep) => controller.findOne(req, rep));
    fastify.get('/api/category/group-by', { schema: schemas.groupBySchema }, (req, rep) => controller.groupBy(req, rep));
    fastify.post('/api/category', { schema: schemas.createSchema }, (req, rep) => controller.create(req, rep));
    fastify.put('/api/category/:id', { schema: schemas.updateSchema }, (req, rep) => controller.update(req, rep));
    fastify.patch('/api/category/:id', { schema: schemas.updatePartialSchema }, (req, rep) => controller.updatePartial(req, rep));
    fastify.delete('/api/category/:id', { schema: schemas.deleteSchema }, (req, rep) => controller.delete(req, rep));
    fastify.get('/api/category/export', (req, rep) => controller.export(req, rep));
    fastify.post('/api/category/import', (req, rep) => controller.import(req, rep));
}
export default CategoryFastifyRoutes;
export { CategoryFastifyRoutes };
