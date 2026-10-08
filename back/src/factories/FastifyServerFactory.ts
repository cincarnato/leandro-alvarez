import FastifyServer from "../servers/FastifyServer.js";
import {
    jwtMiddleware,
    rbacMiddleware,
    apiKeyMiddleware,

    RoleRoutes,
    TenantRoutes,
    UserApiKeyRoutes,
    UserSessionRoutes,
    UserLoginFailRoutes
} from "@drax/identity-back"
import BenefitsMediaRoutes from '../modules/benefits/routes/BenefitsMediaRoutes.js';
import BenefitsFileRoutes from '../modules/benefits/routes/BenefitsFileRoutes.js';
import BenefitSettingRoutes from '../modules/benefits/routes/BenefitSettingRoutes.js';
import {DashboardRoutes} from "@drax/dashboard-back";
import {AuditRoutes} from "@drax/audit-back";
import {AIRoutes, AILogRoutes} from "@drax/ai-back";
import {CrudSavedQueryFastifyRoutes} from "@drax/crud-back";
import {RecoveryFastifyRoutes} from "@drax/recovery-back";
//Local modules routes

import {HealthRoutes} from "../modules/base/routes/HealthRoutes.js"
import {NotificationFastifyRoutes} from "../modules/base/routes/NotificationRoutes.js"

import BenefitUserRoutes from '../modules/benefits/routes/BenefitUserRoutes.js';
import BenefitFastifyRoutes from '../modules/benefits/routes/BenefitRoutes.js';
import CompanyFastifyRoutes from '../modules/benefits/routes/CompanyRoutes.js';
import CategoryFastifyRoutes from '../modules/benefits/routes/CategoryRoutes.js';
import BenefitClaimFastifyRoutes from '../modules/benefits/routes/BenefitClaimRoutes.js';
import BenefitsRoutes from '../modules/benefits/routes/BenefitsRoutes.js';

function FastifyServerFactory(rootDir:string) {
    const server = new FastifyServer(rootDir);
    server.fastifyDecorateRequest('authUser',null)

    //MIDDLEWARES
    server.fastifyHook('onRequest',jwtMiddleware)
    server.fastifyHook('onRequest',apiKeyMiddleware)
    server.fastifyHook('onRequest',rbacMiddleware)

    //IDENTITY ROUTES
    server.fastifyRegister(BenefitUserRoutes)
    server.fastifyRegister(RoleRoutes)
    server.fastifyRegister(TenantRoutes)
    server.fastifyRegister(UserApiKeyRoutes)
    server.fastifyRegister(UserSessionRoutes)
    server.fastifyRegister(UserLoginFailRoutes)

    //DRAX MODULES ROUTES
    server.fastifyRegister(AuditRoutes)
    server.fastifyRegister(BenefitsMediaRoutes)
    server.fastifyRegister(BenefitsFileRoutes)
    server.fastifyRegister(BenefitSettingRoutes)
    server.fastifyRegister(DashboardRoutes)
    server.fastifyRegister(AIRoutes)
    server.fastifyRegister(AILogRoutes)
    server.fastifyRegister(CrudSavedQueryFastifyRoutes)

    server.fastifyRegister(RecoveryFastifyRoutes)

    //LOCAL MODULES ROUTES

    server.fastifyRegister(HealthRoutes)
    server.fastifyRegister(NotificationFastifyRoutes)
    server.fastifyRegister(CompanyFastifyRoutes)
    server.fastifyRegister(CategoryFastifyRoutes)
    server.fastifyRegister(BenefitFastifyRoutes)
    server.fastifyRegister(BenefitClaimFastifyRoutes)
    server.fastifyRegister(BenefitsRoutes)




    return server
}

export default FastifyServerFactory
