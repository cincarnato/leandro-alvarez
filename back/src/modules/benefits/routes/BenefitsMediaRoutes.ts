import type {FastifyPluginAsync} from 'fastify';
import {MediaRoutes} from '@drax/media-back';
import BenefitsMediaController from '../controllers/BenefitsMediaController.js';

const BenefitsMediaRoutes: FastifyPluginAsync = async (fastify, options) => {
    const controller = new BenefitsMediaController();
    fastify.addHook('onRoute', route => {
        if (route.url === '/api/file/:dir' && route.method === 'POST') {
            route.handler = (request, reply) => controller.uploadFile(request, reply);
        }
    });
    fastify.addHook('onSend', async (request, reply, payload) => {
        if (request.method === 'GET' || request.method === 'HEAD') {
            reply.header('X-Content-Type-Options', 'nosniff');
            reply.header('Content-Security-Policy', "default-src 'none'; sandbox");
        }
        return payload;
    });
    await MediaRoutes(fastify, options);
};
export default BenefitsMediaRoutes;
