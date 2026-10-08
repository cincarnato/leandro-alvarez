import type {FastifyPluginAsync} from 'fastify';
import {FileRoutes} from '@drax/media-back';
import BenefitsFileController from '../controllers/BenefitsFileController.js';

const BenefitsFileRoutes: FastifyPluginAsync = async (fastify, options) => {
    const controller = new BenefitsFileController();
    fastify.addHook('onRoute', route => {
        if (route.url === '/api/file/:id' && (route.method === 'GET' || route.method === 'HEAD')) {
            route.handler = (request, reply) => controller.findById(request as any, reply);
        }
    });
    // Keep the installed routes and schemas, replacing only the detail action's
    // nested ownership assertion. List/search/export retain Drax's user filters.
    await FileRoutes(fastify, options);
};
export default BenefitsFileRoutes;
