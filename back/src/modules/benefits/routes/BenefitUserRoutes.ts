import type {FastifyPluginAsync} from 'fastify';
import {UserRoutes} from '@drax/identity-back';
import {z} from 'zod';
import {NotFoundError} from '@drax/common-back';
import InitializeBenefitIdentity from '../../../setup/InitializeBenefitIdentity.js';
import {UserCompanySchema} from '../schemas/UserCompanySchema.js';

const BenefitUserRoutes: FastifyPluginAsync = async (fastify, options) => {
    InitializeBenefitIdentity();
    const companySchema = z.toJSONSchema(UserCompanySchema).properties.company;
    const extendResponse = (schema: any) => {
        if (!schema || typeof schema !== 'object') return;
        if (schema.properties?.username && schema.properties?.role) schema.properties.company = companySchema;
        for (const value of Object.values(schema)) {
            if (Array.isArray(value)) value.forEach(extendResponse);
            else if (value && typeof value === 'object') extendResponse(value);
        }
    };
    fastify.addHook('onRoute', route => {
        if (route.url === '/api/users/register' && route.method === 'POST') {
            // Keep Drax login and administrative CRUD, but never register visitors.
            route.schema = {hide: true};
            route.handler = async (_request, reply) => reply
                .header('Cache-Control', 'no-store')
                .code(404).send(new NotFoundError().body);
            return;
        }
        if (route.schema?.body && (route.url === '/api/users' || route.url === '/api/users/:id')) {
            (route.schema.body as any).properties.company = companySchema;
        }
        extendResponse(route.schema?.response);
    });

    await UserRoutes(fastify, options);
};
export default BenefitUserRoutes;
