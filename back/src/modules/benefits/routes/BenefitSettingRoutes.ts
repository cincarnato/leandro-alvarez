import type {FastifyPluginAsync} from 'fastify';
import {SettingRoutes, SettingPermissions} from '@drax/settings-back';

// Drax's settings reads only check per-setting permissions, not setting:view.
// Protect the administrative routes consistently with the MVP role matrix.
const BenefitSettingRoutes: FastifyPluginAsync = async (fastify, options) => {
    fastify.addHook('preHandler', async (request: any, reply) => {
        // Preserve Drax's anonymous reads of explicitly public settings.
        if (!request.authUser && request.method === 'GET' && request.routeOptions.url !== '/api/settings/grouped') return;
        try {
            const permission = request.method === 'PATCH' ? SettingPermissions.Update
                : request.routeOptions.url === '/api/settings/grouped' ? SettingPermissions.Manage : SettingPermissions.View;
            request.rbac.assertOrPermissions([permission, SettingPermissions.Manage]);
        } catch (error) {
            return reply.code(error.statusCode ?? 500).send(error.body ?? {error: 'error.server'});
        }
    });
    await SettingRoutes(fastify, options);
};
export default BenefitSettingRoutes;
