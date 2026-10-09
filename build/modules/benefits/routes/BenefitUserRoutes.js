import { UserRoutes } from '@drax/identity-back';
import { NotFoundError } from '@drax/common-back';
const BenefitUserRoutes = async (fastify, options) => {
    fastify.addHook('onRoute', route => {
        if (route.url === '/api/users/register' && route.method === 'POST') {
            // Keep Drax login and administrative CRUD, but never register visitors.
            route.schema = { hide: true };
            route.handler = async (_request, reply) => reply
                .header('Cache-Control', 'no-store')
                .code(404).send(new NotFoundError().body);
            return;
        }
    });
    await UserRoutes(fastify, options);
};
export default BenefitUserRoutes;
