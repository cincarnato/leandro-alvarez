import {after, before, beforeEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import {mkdtemp, readdir, rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {FileServiceFactory} from '@drax/media-back';
import BenefitsMediaRoutes from '../../../src/modules/benefits/routes/BenefitsMediaRoutes.js';
import {rasterFixtures} from './raster-fixtures.js';
import BenefitsFileRoutes from '../../../src/modules/benefits/routes/BenefitsFileRoutes.js';
import {CommonConfig, DraxConfig, LoadCommonConfigFromEnv, mongoose} from '@drax/common-back';
import {
    LoadIdentityConfigFromEnv, CreateOrUpdateRole, UserServiceFactory, RoleRoutes, PermissionService,
    jwtMiddleware, apiKeyMiddleware, rbacMiddleware,
} from '@drax/identity-back';
import BenefitSettingRoutes from '../../../src/modules/benefits/routes/BenefitSettingRoutes.js';
import MongoInMemory from '../../setup/MongoInMemory.js';
import InitializePermissions from '../../../src/setup/InitializePermissions.js';
import InitializeBenefitIdentity from '../../../src/setup/InitializeBenefitIdentity.js';
import InitializeMediaConfig from '../../../src/setup/InitializeMediaConfig.js';
import CreateSystemRoles from '../../../src/setup/CreateSystemRoles.js';
import BenefitUserRoutes from '../../../src/modules/benefits/routes/BenefitUserRoutes.js';
import CompanyRoutes from '../../../src/modules/benefits/routes/CompanyRoutes.js';
import CategoryRoutes from '../../../src/modules/benefits/routes/CategoryRoutes.js';
import BenefitRoutes from '../../../src/modules/benefits/routes/BenefitRoutes.js';
import BenefitClaimRoutes from '../../../src/modules/benefits/routes/BenefitClaimRoutes.js';
import BenefitsRoutes from '../../../src/modules/benefits/routes/BenefitsRoutes.js';
import CompanyServiceFactory from '../../../src/modules/benefits/factory/services/CompanyServiceFactory.js';
import CategoryServiceFactory from '../../../src/modules/benefits/factory/services/CategoryServiceFactory.js';
import BenefitServiceFactory from '../../../src/modules/benefits/factory/services/BenefitServiceFactory.js';
import BenefitClaimServiceFactory from '../../../src/modules/benefits/factory/services/BenefitClaimServiceFactory.js';
import BenefitClaimModel from '../../../src/modules/benefits/models/BenefitClaimModel.js';
import BenefitClaimMongoRepository from '../../../src/modules/benefits/repository/mongo/BenefitClaimMongoRepository.js';
import {benefitsRateLimit} from '../../../src/modules/benefits/routes/BenefitsRateLimit.js';
import FastifyServerFactory from '../../../src/factories/FastifyServerFactory.js';

const missingId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const unknownToken = 'a'.repeat(64);

function assertSafeCoupon(coupon) {
    assert.deepEqual(Object.keys(coupon).sort(), ['benefit', 'createdAt', 'redeemedAt', 'token']);
    assert.match(coupon.token, /^[a-f\d]{64}$/);
    assert.ok(!Number.isNaN(Date.parse(coupon.createdAt)));
    assert.deepEqual(Object.keys(coupon.benefit.company).sort(), ['_id', 'active', 'logo', 'name']);
    assert.deepEqual(Object.keys(coupon.benefit.category).sort(), ['_id', 'name']);
    const text = JSON.stringify(coupon);
    for (const field of ['contactEmail', 'contactName', 'contactPhone', 'cuit', 'redeemedBy', 'password', 'secret@example.com']) {
        assert.ok(!text.includes(field), field);
    }
}

describe('Benefits MVP: real Drax HTTP/RBAC + MongoInMemory', {concurrency: false}, () => {
    const mongo = new MongoInMemory();
    const app = Fastify();
    let adminRole, managerRole, merchantRole, basicRole;
    let adminToken: string, managerToken: string, basicToken: string;
    let company, otherCompany, category, otherCategory, benefit, otherBenefit;
    let merchantToken: string, otherMerchantToken: string, merchantUser;
    const companies = CompanyServiceFactory;
    const categories = CategoryServiceFactory;
    const benefits = BenefitServiceFactory;
    const claims = BenefitClaimServiceFactory;
    let sequence = 0;
    let ipSequence = 0;
    let mediaDir: string;

    async function request(method, url, payload?, token?: string, ip?: string) {
        return app.inject({method, url, payload, remoteAddress: ip ?? `192.0.2.${++ipSequence % 250 + 1}`,
            headers: token ? {authorization: `Bearer ${token}`} : {}});
    }
    async function createUser(name: string, role, companyId?: string) {
        const user = await UserServiceFactory().create({
            name, username: name, email: `${name}@example.com`, password: 'Testing.123!',
            active: true, role: role._id.toString(), ...(companyId ? {company: companyId} : {}),
        } as any);
        const response = await request('POST', '/api/auth/login', {username: name, password: 'Testing.123!'});
        assert.equal(response.statusCode, 200, response.body);
        return {user, token: response.json().accessToken};
    }
    async function issue(id = benefit._id) {
        const response = await request('POST', `/api/benefits/${id}/claim`);
        assert.equal(response.statusCode, 200, response.body);
        return response.json();
    }

    before(async () => {
        process.env.DRAX_DB_ENGINE = 'mongo';
        process.env.DRAX_JWT_SECRET = 'benefits-mvp-test-secret';
        process.env.DRAX_FILE_METADATA = 'true';
        mediaDir = await mkdtemp(resolve('test/.benefits-media-'));
        LoadCommonConfigFromEnv();
        DraxConfig.set(CommonConfig.FileDir, mediaDir);
        InitializeMediaConfig();
        LoadIdentityConfigFromEnv();
        InitializePermissions();
        InitializeBenefitIdentity();
        await mongo.connect();
        await CreateSystemRoles();
        const {RoleServiceFactory} = await import('@drax/identity-back');
        adminRole = await RoleServiceFactory().findByName('ADMIN');
        managerRole = await RoleServiceFactory().findByName('MANAGER');
        merchantRole = await RoleServiceFactory().findByName('MERCHANT');
        basicRole = await CreateOrUpdateRole({name: 'BENEFITS_BASIC', permissions: [], childRoles: []});
        assert.deepEqual([...adminRole.permissions].sort(), [...PermissionService.getPermissions()].sort());
        app.setValidatorCompiler(() => () => true); // Same as the production Drax server.
        app.addHook('onRequest', jwtMiddleware);
        app.addHook('onRequest', apiKeyMiddleware);
        app.addHook('onRequest', rbacMiddleware);
        app.register(multipart);
        app.register(fastifyStatic, {root: mediaDir, serve: false});
        for (const routes of [BenefitUserRoutes, RoleRoutes, BenefitSettingRoutes, BenefitsMediaRoutes, BenefitsFileRoutes, CompanyRoutes, CategoryRoutes, BenefitRoutes, BenefitClaimRoutes, BenefitsRoutes]) {
            app.register(routes);
        }
        await app.ready();
        adminToken = (await createUser('benefitsadmin', adminRole)).token;
        managerToken = (await createUser('benefitsmanager', managerRole)).token;
        basicToken = (await createUser('benefitsbasic', basicRole)).token;
        await BenefitClaimModel.init(); // Ensure the real unique token index exists.
    });

    beforeEach(async () => {
        // Fixture cleanup only; application database operations live in repositories.
        for (const name of ['BenefitClaim', 'Benefit', 'Category', 'Company']) {
            await mongoose.connection.collection(name).deleteMany({});
        }
        sequence++;
        company = await companies.instance.create({name: `Company ${sequence}`, logo: 'logo.png',
            cuit: 'private', contactEmail: 'secret@example.com', contactName: 'private', contactPhone: 'private'});
        otherCompany = await companies.instance.create({name: 'Other company'});
        category = await categories.instance.create({name: 'Food'});
        otherCategory = await categories.instance.create({name: 'Travel'});
        const data = {title: 'Discount', description: 'Description', image: 'benefit.png', company: company._id,
            category: category._id, startDate: new Date(Date.now() - 60_000), endDate: new Date(Date.now() + 60_000), conditions: 'Show coupon'};
        benefit = await benefits.instance.create(data);
        otherBenefit = await benefits.instance.create({...data, title: 'Other', company: otherCompany._id, category: otherCategory._id});
        const merchant = await createUser(`merchant${sequence}`, merchantRole, company._id);
        merchantToken = merchant.token;
        merchantUser = merchant.user;
        otherMerchantToken = (await createUser(`othermerchant${sequence}`, merchantRole, otherCompany._id)).token;
    });

    after(async () => {
            try { await app.close(); await mongo.dropAndClose(); }
            finally { if (mediaDir) await rm(mediaDir, {recursive: true, force: true}); }
        });

    it('applies create defaults and never resets flags on PATCH', async () => {
        assert.equal(company.active, true);
        assert.equal(benefit.active, true);
        assert.equal(benefit.featured, false);
        let response = await request('PATCH', `/api/benefit/${benefit._id}`, {active: false, featured: true}, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        response = await request('PATCH', `/api/benefit/${benefit._id}`, {title: 'Changed'}, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().active, false);
        assert.equal(response.json().featured, true);
        await companies.instance.updatePartial(company._id, {active: false});
        response = await request('PATCH', `/api/company/${company._id}`, {name: 'Changed'}, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().active, false);
    });

    it('validates date ranges on create, PUT and combined PATCH; casts ISO dates', async () => {
        const input = {...benefit, company: company._id, category: category._id};
        let response = await request('POST', '/api/benefit', {...input, endDate: new Date(0).toISOString()}, managerToken);
        assert.equal(response.statusCode, 422, response.body);
        response = await request('PUT', `/api/benefit/${benefit._id}`, {...input, startDate: new Date(Date.now() + 120_000).toISOString()}, managerToken);
        assert.equal(response.statusCode, 422, response.body);
        for (const payload of [{endDate: new Date(0).toISOString()}, {startDate: new Date(Date.now() + 120_000).toISOString()}, {endDate: 'not-a-date'}]) {
            response = await request('PATCH', `/api/benefit/${benefit._id}`, payload, managerToken);
            assert.equal(response.statusCode, 422, response.body);
        }
        response = await request('PATCH', `/api/benefit/${benefit._id}`, {
            startDate: new Date(Date.now() + 120_000).toISOString(), endDate: new Date(Date.now() + 180_000).toISOString(),
        }, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.ok((await benefits.instance.findById(benefit._id)).startDate instanceof Date);
        response = await request('PATCH', `/api/benefit/${missingId}`, {title: 'Missing'}, managerToken);
        assert.equal(response.statusCode, 404, response.body);
        const sameDate = new Date(Date.now() + 120_000).toISOString();
        response = await request('POST', '/api/benefit', {...input, startDate: sameDate, endDate: sameDate}, managerToken);
        assert.equal(response.statusCode, 200, response.body);
    });

    it('validates company/category relationships through services', async () => {
        for (const payload of [{company: missingId}, {category: missingId}, {company: 'invalid'}]) {
            const response = await request('PATCH', `/api/benefit/${benefit._id}`, payload, managerToken);
            assert.equal(response.statusCode, 422, response.body);
        }
        const response = await request('POST', '/api/benefit', {...benefit, company: missingId, category: category._id}, managerToken);
        assert.equal(response.statusCode, 422, response.body);
    });

    it('lists only currently active benefits of active companies, filters category, and projects public data', async () => {
        const make = overrides => benefits.instance.create({...benefit, company: company._id, category: category._id, ...overrides});
        await make({title: 'Inactive', active: false});
        await make({title: 'Future', startDate: new Date(Date.now() + 20_000)});
        await make({title: 'Expired', startDate: new Date(0), endDate: new Date(1)});
        await companies.instance.updatePartial(otherCompany._id, {active: false});
        let response = await request('GET', '/api/public/benefits');
        assert.equal(response.statusCode, 200, response.body);
        assert.deepEqual(response.json().items.map(item => item._id), [benefit._id]);
        assert.ok(!response.body.includes('contactEmail'));
        response = await request('GET', `/api/public/benefits?category=${otherCategory._id}`);
        assert.deepEqual(response.json(), {items: []});
        response = await request('GET', `/api/public/benefits?category=${category._id}`);
        assert.equal(response.json().items.length, 1);
        response = await request('GET', '/api/public/benefits?category=invalid');
        assert.equal(response.statusCode, 422);
        response = await request('GET', `/api/public/benefits/${otherBenefit._id}`);
        assert.equal(response.statusCode, 404);
        response = await request('GET', `/api/public/benefits/${benefit._id}`);
        assert.equal(response.statusCode, 200, response.body);
        response = await request('GET', '/api/public/categories');
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().items.length, 2);
        assert.deepEqual(Object.keys(response.json().items[0]).sort(), ['_id', 'name']);
    });

    it('issues secure unique tokens with timestamps and exposes only safe coupons', async () => {
        const first = await issue();
        const second = await issue();
        assert.notEqual(first.token, second.token);
        assert.equal(first.redeemedAt, null);
        assertSafeCoupon(first);
        const stored = await claims.instance.byToken(first.token);
        assert.ok(stored.createdAt instanceof Date);
        assert.ok(stored.updatedAt instanceof Date);
        await assert.rejects(new BenefitClaimMongoRepository().create({benefit: benefit._id, token: first.token}));
        const response = await request('GET', `/api/public/benefit-claims/${first.token}`);
        assert.equal(response.statusCode, 200, response.body);
        assertSafeCoupon(response.json());
        assert.equal((await request('GET', `/api/public/benefit-claims/${unknownToken}`)).statusCode, 404);
        assert.equal((await request('GET', '/api/public/benefit-claims/invalid')).statusCode, 422);
        assert.equal((await request('POST', '/api/benefits/invalid/claim')).statusCode, 422);
        assert.equal((await request('POST', `/api/benefits/${missingId}/claim`)).statusCode, 404);
    });

    it('rejects issue/redeem on inactive, future, expired benefits and inactive companies, without consuming coupons', async () => {
        for (const state of ['inactive', 'future', 'expired', 'company']) {
            const coupon = await issue();
            if (state === 'inactive') await benefits.instance.updatePartial(benefit._id, {active: false});
            if (state === 'future') await benefits.instance.updatePartial(benefit._id, {startDate: new Date(Date.now() + 20_000)});
            if (state === 'expired') await benefits.instance.updatePartial(benefit._id, {startDate: new Date(0), endDate: new Date(1)});
            if (state === 'company') await companies.instance.updatePartial(company._id, {active: false});
            assert.equal((await request('POST', `/api/benefits/${benefit._id}/claim`)).statusCode, 404, state);
            const response = await request('POST', `/api/benefit-claims/${coupon.token}/redeem`, undefined, merchantToken);
            assert.equal(response.statusCode, 404, response.body);
            assert.equal((await claims.instance.byToken(coupon.token)).redeemedAt, null);
            // Existing coupons remain readable even after a promotion is disabled/expired.
            assert.equal((await request('GET', `/api/public/benefit-claims/${coupon.token}`)).statusCode, 200);
            await benefits.instance.updatePartial(benefit._id, {active: true, startDate: new Date(Date.now() - 60_000), endDate: new Date(Date.now() + 60_000)});
            await companies.instance.updatePartial(company._id, {active: true});
        }
    });

    it('atomically redeems only once under concurrent HTTP requests and records operator without leaking identity', async () => {
        const coupon = await issue();
        const responses = await Promise.all(Array.from({length: 8}, () => request('POST', `/api/benefit-claims/${coupon.token}/redeem`, undefined, merchantToken)));
        assert.equal(responses.filter(response => response.statusCode === 200).length, 1, responses.map(response => response.body).join('\n'));
        assert.equal(responses.filter(response => response.statusCode === 400).length, 7);
        assertSafeCoupon(responses.find(response => response.statusCode === 200).json());
        const stored = await claims.instance.byToken(coupon.token);
        assert.ok(stored.redeemedAt instanceof Date);
        assert.equal(stored.redeemedBy, merchantUser._id.toString());
        const response = await request('GET', `/api/public/benefit-claims/${coupon.token}`);
        assertSafeCoupon(response.json());
        assert.ok(response.json().redeemedAt);
    });

    it('requires authentication and exact view/redeem/statistics permissions', async () => {
        const coupon = await issue();
        for (const [method, url] of [
            ['GET', '/api/benefit-claims'], ['GET', `/api/benefit-claims/${coupon.token}/inspect`],
            ['POST', `/api/benefit-claims/${coupon.token}/redeem`], ['GET', '/api/benefit-statistics'],
        ]) {
            assert.equal((await request(method, url)).statusCode, 401, url);
            assert.equal((await request(method, url, undefined, basicToken)).statusCode, 403, url);
        }
        for (const roleToken of [managerToken, adminToken]) {
            assert.equal((await request('GET', '/api/benefit-claims', undefined, roleToken)).statusCode, 200);
            assert.equal((await request('GET', `/api/benefit-claims/${coupon.token}/inspect`, undefined, roleToken)).statusCode, 200);
            assert.equal((await request('GET', '/api/benefit-statistics', undefined, roleToken)).statusCode, 200);
        }
        const viewRole = await CreateOrUpdateRole({name: 'CLAIM_VIEW', permissions: ['benefitclaim:view'], childRoles: []});
        const viewToken = (await createUser(`viewer${sequence}`, viewRole)).token;
        assert.equal((await request('GET', `/api/benefit-claims/${coupon.token}/inspect`, undefined, viewToken)).statusCode, 200);
        assert.equal((await request('POST', `/api/benefit-claims/${coupon.token}/redeem`, undefined, viewToken)).statusCode, 403);
        assert.equal((await request('GET', `/api/benefit-claims/${unknownToken}/inspect`, undefined, adminToken)).statusCode, 404);
    });

    it('scopes ALL merchant list/inspect/redeem paths and cannot bypass scope through filters or OR groups', async () => {
        const own = await issue();
        const foreign = await issue(otherBenefit._id);
        for (const query of ['', `?filters=benefit;eq;${otherBenefit._id}`, `?filters=benefit;in;${otherBenefit._id}`, `?filters=benefit;eq;${otherBenefit._id};scope|token;eq;${foreign.token};scope`]) {
            const response = await request('GET', `/api/benefit-claims${query}`, undefined, merchantToken);
            assert.equal(response.statusCode, 200, response.body);
            assert.ok(response.json().items.every(item => item.token === own.token));
            assert.ok(!response.body.includes(foreign.token));
        }
        const ownPage = await request('GET', '/api/benefit-claims?page=1&limit=1', undefined, merchantToken);
        assert.equal(ownPage.json().total, 1, ownPage.body);
        assertSafeCoupon(ownPage.json().items[0]);
        const foreignPage = await request('GET', '/api/benefit-claims', undefined, otherMerchantToken);
        assert.deepEqual(foreignPage.json().items.map(item => item.token), [foreign.token]);
        for (const [method, suffix] of [['GET', 'inspect'], ['POST', 'redeem']]) {
            assert.equal((await request(method, `/api/benefit-claims/${foreign.token}/${suffix}`, undefined, merchantToken)).statusCode, 403);
        }
        assert.equal((await request('GET', `/api/benefit-claims/${own.token}/inspect`, undefined, merchantToken)).statusCode, 200);
        assert.equal((await request('GET', '/api/benefit-statistics', undefined, merchantToken)).statusCode, 403);
        // Even a misconfigured MERCHANT with statistics permission must be denied.
        await CreateOrUpdateRole({...merchantRole, permissions: [...merchantRole.permissions, 'benefits:statistics']});
        assert.equal((await request('GET', '/api/benefit-statistics', undefined, merchantToken)).statusCode, 403);
    });

    it('uses persisted User.company rather than token/request data; fails closed when no company exists', async () => {
        const own = await issue();
        const foreign = await issue(otherBenefit._id);
        const me = await request('GET', '/api/auth/me', undefined, merchantToken);
        assert.equal(me.statusCode, 200, me.body);
        assert.equal(me.json().company, company._id);
        const user = await UserServiceFactory().findById(merchantUser._id.toString());
        const update = {name: user.name, username: user.username, email: user.email, active: true, role: merchantRole._id.toString(), company: otherCompany._id};
        let response = await request('PUT', `/api/users/${merchantUser._id}`, update, adminToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().company, otherCompany._id);
        response = await request('GET', '/api/benefit-claims', undefined, merchantToken);
        assert.deepEqual(response.json().items.map(item => item.token), [foreign.token]);
        assert.equal((await request('POST', `/api/benefit-claims/${own.token}/redeem`, {company: company._id}, merchantToken)).statusCode, 403);
        // Simulate a legacy unassigned merchant using the Drax repository, not a fake JWT.
        const {default: UserMongoRepository} = await import('@drax/identity-back/dist/repository/mongo/UserMongoRepository.js');
        await new UserMongoRepository().updatePartial(merchantUser._id.toString(), {company: null} as any);
        for (const [method, url] of [['GET', '/api/benefit-claims'], ['GET', `/api/benefit-claims/${foreign.token}/inspect`], ['POST', `/api/benefit-claims/${foreign.token}/redeem`]]) {
            assert.equal((await request(method, url, undefined, merchantToken)).statusCode, 403, url);
        }
    });

    it('disables visitor registration and Google in the real MVP factory while preserving admin login and user CRUD', async () => {
        const server = FastifyServerFactory(mediaDir);
        const productionApp = Reflect.get(server, 'fastifyServer');
        const users = UserServiceFactory();
        const initial = (await users.paginate({page: 1, limit: 1})).total;
        const visitor = {
            name: 'Visitor', username: `visitor${sequence}`, email: `visitor${sequence}@example.com`, password: 'Testing.123!',
        };
        const operator = {
            ...visitor, name: 'Operator', username: `operator${sequence}`, email: `operator${sequence}@example.com`,
            active: true, role: merchantRole._id.toString(), company: company._id,
        };
        try {
            await productionApp.ready();
            for (const session of [undefined, adminToken]) {
                const response = await productionApp.inject({
                    method: 'POST', url: '/api/users/register', payload: visitor,
                    headers: session ? {authorization: `Bearer ${session}`} : {},
                });
                assert.equal(response.statusCode, 404, response.body);
                assert.equal(response.headers['cache-control'], 'no-store');
                assert.match(response.headers['content-type'], /application\/json/);
            }
            for (const url of ['/api/google/login', '/api/google/logout']) {
                const response = await productionApp.inject({method: 'POST', url, payload: {token: 'unused-google-token'}});
                assert.equal(response.statusCode, 404, response.body);
                assert.match(response.headers['content-type'], /application\/json/);
            }
            assert.equal((await users.paginate({page: 1, limit: 1})).total, initial);
            const schema = productionApp.swagger();
            assert.ok(!schema.paths['/api/users/register']);
            assert.ok(!schema.paths['/api/google/login']);
            const login = await productionApp.inject({method: 'POST', url: '/api/auth/login', payload: {username: 'benefitsadmin', password: 'Testing.123!'}});
            assert.equal(login.statusCode, 200, login.body);
            const headers = {authorization: `Bearer ${login.json().accessToken}`};
            const create = await productionApp.inject({method: 'POST', url: '/api/users', payload: operator, headers});
            assert.equal(create.statusCode, 200, create.body);
            const id = create.json()._id;
            assert.equal(create.json().company, company._id);
            const operatorLogin = await productionApp.inject({method: 'POST', url: '/api/auth/login', payload: {username: operator.username, password: operator.password}});
            assert.equal(operatorLogin.statusCode, 200, operatorLogin.body);
            const list = await productionApp.inject({method: 'GET', url: '/api/users', headers});
            assert.equal(list.statusCode, 200, list.body);
            const update = await productionApp.inject({method: 'PUT', url: `/api/users/${id}`, headers, payload: {...operator, name: 'Updated operator'}});
            assert.equal(update.statusCode, 200, update.body);
            assert.equal(update.json().name, 'Updated operator');
            const remove = await productionApp.inject({method: 'DELETE', url: `/api/users/${id}`, headers});
            assert.equal(remove.statusCode, 200, remove.body);
            assert.equal((await users.paginate({page: 1, limit: 1})).total, initial);
        } finally { await productionApp.close(); }
    });

    it('validates merchant company assignment via Drax user writes and denies manager identity/settings administration', async () => {
        const data = {name: 'New merchant', username: `newmerchant${sequence}`, email: `newmerchant${sequence}@example.com`, password: 'Testing.123!', active: true, role: merchantRole._id.toString()};
        for (const extra of [{}, {company: missingId}, {company: 'invalid'}]) {
            const response = await request('POST', '/api/users', {...data, ...extra}, adminToken);
            assert.equal(response.statusCode, 422, response.body);
        }
        const response = await request('POST', '/api/users', {...data, company: company._id}, adminToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.equal(response.json().company, company._id);
        for (const url of ['/api/users', '/api/roles', '/api/settings', '/api/settings/grouped', '/api/settings/example']) {
            for (const token of [managerToken, merchantToken]) {
                assert.equal((await request('GET', url, undefined, token)).statusCode, 403, url);
            }
        }
        for (const token of [managerToken, merchantToken]) {
            assert.equal((await request('PATCH', `/api/settings/${missingId}`, {value: 'changed'}, token)).statusCode, 403);
        }
        assert.equal((await request('GET', '/api/settings', undefined, adminToken)).statusCode, 200);
        assert.equal((await request('GET', '/api/settings')).statusCode, 200);
        assert.equal((await request('GET', '/api/settings/grouped')).statusCode, 401);
        assert.equal((await request('POST', '/api/users', data, managerToken)).statusCode, 403);
        assert.deepEqual(managerRole.permissions.filter(permission => permission.startsWith('file:')).sort(), ['file:upload', 'file:view']);
                assert.ok(managerRole.permissions.filter(permission => !permission.startsWith('file:')).every(permission => /^(company|category|benefit|benefitclaim|benefits):/.test(permission)));
    });

    it('registers generated CRUDs with existing lowercase permissions; merchant cannot mutate them', async () => {
        for (const [path, input] of [['company', {name: 'New company'}], ['category', {name: 'New category'}], ['benefit', {...benefit, title: 'New benefit', company: company._id, category: category._id}]]) {
            for (const token of [managerToken, adminToken]) {
                const create = await request('POST', `/api/${path}`, input, token);
                assert.equal(create.statusCode, 200, create.body);
                const id = create.json()._id;
                assert.equal((await request('GET', `/api/${path}/${id}`, undefined, token)).statusCode, 200);
                assert.equal((await request('GET', `/api/${path}?limit=1`, undefined, token)).statusCode, 200);
                assert.equal((await request('PUT', `/api/${path}/${id}`, input, token)).statusCode, 200);
                assert.equal((await request('DELETE', `/api/${path}/${id}`, undefined, token)).statusCode, 200);
            }
            assert.equal((await request('POST', `/api/${path}`, input, merchantToken)).statusCode, 403);
            assert.equal((await request('GET', `/api/${path}`, undefined, merchantToken)).statusCode, 403);
        }
    });

    it('exposes no generic claim mutations, exports or unscoped reads, including the generated legacy path', async () => {
        for (const [method, path] of [
            ['POST', '/api/benefit-claims'], ['PUT', `/api/benefit-claims/${missingId}`], ['PATCH', `/api/benefit-claims/${missingId}`],
            ['DELETE', `/api/benefit-claims/${missingId}`], ['POST', '/api/benefit-claims/import'],
            ['GET', '/api/benefit-claims/export'], ['GET', '/api/benefit-claims/find'], ['GET', '/api/benefit-claims/group-by'],
            ['GET', '/api/benefitclaim'], ['POST', '/api/benefitclaim'],
        ]) assert.equal((await request(method, path, undefined, adminToken)).statusCode, 404, path);
        await assert.rejects(claims.instance.create({benefit: benefit._id, token: unknownToken}), {name: 'MethodNotAllowedError'});
        await assert.rejects(claims.instance.update(missingId, {benefit: benefit._id, token: unknownToken}), {name: 'MethodNotAllowedError'});
        await assert.rejects(claims.instance.updatePartial(missingId, {redeemedAt: new Date()}), {name: 'MethodNotAllowedError'});
        await assert.rejects(claims.instance.delete(missingId), {name: 'MethodNotAllowedError'});
    });

    it('returns statistics and Drax pagination with correct totals', async () => {
        const coupon = await issue();
        await issue();
        assert.equal((await request('POST', `/api/benefit-claims/${coupon.token}/redeem`, undefined, managerToken)).statusCode, 200);
        const response = await request('GET', '/api/benefit-statistics', undefined, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.deepEqual(response.json(), {
                    claims: 2, redeemed: 1, pending: 1,
                    byBenefit: [{id: benefit._id, name: benefit.title, generated: 2, redeemed: 1}],
                    byCompany: [{id: company._id, name: company.name, generated: 2, redeemed: 1}],
                });
        const page = await request('GET', '/api/benefit-claims?page=2&limit=1', undefined, adminToken);
        assert.equal(page.statusCode, 200, page.body);
        assert.equal(page.json().total, 2);
        assert.equal(page.json().page, 2);
        assert.equal(page.json().limit, 1);
        assert.equal(page.json().items.length, 1);
        assert.equal((await request('GET', '/api/benefit-claims?limit=101', undefined, adminToken)).statusCode, 400);
        for (const query of ['limit=-1', 'limit=0', 'limit=abc', 'page=0', 'page=-1', 'page=1.5']) {
            assert.equal((await request('GET', `/api/benefit-claims?${query}`, undefined, adminToken)).statusCode, 422, query);
        }
    });

    it('MANAGER uploads logo/image through real Drax Media, reads own files, but cannot administer files', async () => {
        const image = rasterFixtures[0].bytes;
        async function upload(dir: string, token?: string) {
            const boundary = 'benefits-image-boundary';
            return app.inject({method: 'POST', url: `/api/file/${dir}`,
                headers: {'content-type': `multipart/form-data; boundary=${boundary}`, ...(token ? {authorization: `Bearer ${token}`} : {})},
                payload: Buffer.concat([
                    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.png"\r\nContent-Type: image/png\r\n\r\n`),
                    image, Buffer.from(`\r\n--${boundary}--\r\n`),
                ]),
            });
        }
        for (const [dir, entity, field] of [['company', company, 'logo'], ['benefit', benefit, 'image']] as const) {
            const uploaded = await upload(dir, managerToken);
            assert.equal(uploaded.statusCode, 200, uploaded.body);
            const file = uploaded.json();
            assert.equal(file.mimetype, 'image/png');
            assert.equal(file.size, image.length);
            assert.ok(file.url.startsWith(`/api/file/${dir}/`) || file.url.includes(`/api/file/${dir}/`));
            const metadata = await FileServiceFactory.instance.findOneBy('url', file.url);
            assert.ok(metadata);
            assert.equal((await request('GET', `/api/file/${metadata._id}`, undefined, managerToken)).statusCode, 200);
            const download = await request('GET', new URL(file.url, 'http://localhost').pathname);
            assert.equal(download.statusCode, 200, download.body);
            assert.deepEqual(download.rawPayload, image);
                        assert.equal(download.headers['x-content-type-options'], 'nosniff');
                        assert.equal(download.headers['content-security-policy'], "default-src 'none'; sandbox");
            assert.equal((await request('PATCH', `/api/${dir}/${entity._id}`, {[field]: file.url}, managerToken)).statusCode, 200);
            assert.equal((await request('DELETE', new URL(file.url, 'http://localhost').pathname, undefined, managerToken)).statusCode, 403);
            for (const method of ['PUT', 'PATCH', 'DELETE']) {
                assert.equal((await request(method, `/api/file/${metadata._id}`, undefined, managerToken)).statusCode, 403);
            }
        }
        const foreignUpload = await upload('company', adminToken);
        assert.equal(foreignUpload.statusCode, 200, foreignUpload.body);
        const foreign = await FileServiceFactory.instance.findOneBy('url', foreignUpload.json().url);
        const ownPage = await request('GET', '/api/file', undefined, managerToken);
        assert.equal(ownPage.statusCode, 200, ownPage.body);
        assert.equal(ownPage.json().total, 2);
        assert.ok(ownPage.json().items.every(item => item._id !== foreign._id));
        assert.equal((await request('GET', `/api/file/${foreign._id}`, undefined, managerToken)).statusCode, 403);
                assert.equal((await request('HEAD', `/api/file/${foreign._id}`, undefined, managerToken)).statusCode, 403);
                assert.equal((await request('GET', `/api/file/${foreign._id}`, undefined, adminToken)).statusCode, 200);
        assert.equal((await request('POST', '/api/file', {}, managerToken)).statusCode, 403);
        assert.equal((await upload('company', merchantToken)).statusCode, 403);
        assert.equal((await upload('company')).statusCode, 401);
    });

    it('upload endpoint allows PNG/JPEG/WebP/GIF but blocks HTML/SVG, MIME/extension spoofs, invalid and oversized images for all roles', async () => {
        async function upload(filename: string, mimetype: string, bytes: Buffer, token = managerToken) {
            const boundary = 'raster-security-boundary';
            return app.inject({method: 'POST', url: '/api/file/benefit',
                headers: {authorization: `Bearer ${token}`, 'content-type': `multipart/form-data; boundary=${boundary}`},
                payload: Buffer.concat([
                    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimetype}\r\n\r\n`),
                    bytes, Buffer.from(`\r\n--${boundary}--\r\n`),
                ]),
            });
        }
        for (const fixture of rasterFixtures) {
            const response = await upload(fixture.filename, fixture.mimetype, fixture.bytes);
            assert.equal(response.statusCode, 200, response.body);
            const download = await request('GET', new URL(response.json().url, 'http://localhost').pathname);
            assert.equal(download.statusCode, 200, download.body);
            assert.equal(download.headers['content-type'], fixture.mimetype);
            assert.equal(download.headers['x-content-type-options'], 'nosniff');
            assert.deepEqual(download.rawPayload, fixture.bytes);
        }
        const metadataBefore = (await FileServiceFactory.instance.fetchAll()).length;
        const filesBefore = (await readdir(mediaDir, {recursive: true})).sort();
        const html = Buffer.from('<!DOCTYPE html><script>alert(document.cookie)</script>');
        const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.cookie)"></svg>');
        const png = rasterFixtures[0].bytes;
        for (const token of [managerToken, adminToken]) {
            for (const [filename, mimetype, bytes] of [
                ['page.html', 'text/html', html], ['image.svg', 'image/svg+xml', svg],
                ['image.png', 'image/png', html], ['image.png', 'image/png', svg],
                ['image.html', 'image/png', png], ['image.svg', 'image/png', png],
                ['image.png', 'text/html', png], ['image.jpg', 'image/png', png],
                ['image.jpg', 'image/jpeg', png], ['image.png', 'image/png', Buffer.alloc(0)],
                ['image.png', 'image/png', png.subarray(0, 20)],
                ['image.png', 'image/png', Buffer.concat([png, html])],
                ['image.webp', 'image/webp', Buffer.from('RIFF0000WEBP')],
                ['image.gif', 'image/gif', Buffer.from('GIF89a')],
                ['image.gif', 'image/gif', Buffer.concat([rasterFixtures[3].bytes.subarray(0, 13), Buffer.from('<script>alert(1)</script>,data;')])],
            ] as const) {
                const response = await upload(filename, mimetype, bytes, token);
                assert.equal(response.statusCode, 400, `${filename} ${mimetype}: ${response.body}`);
            }
        }
        const tooLarge = Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]);
        for (const token of [managerToken, adminToken]) {
            const oversized = await upload('image.png', 'image/png', tooLarge, token);
            assert.equal(oversized.statusCode, 413, oversized.body);
            const nonMultipart = await app.inject({method: 'POST', url: '/api/file/benefit', payload: html,
                headers: {authorization: `Bearer ${token}`, 'content-type': 'text/plain'}});
            assert.equal(nonMultipart.statusCode, 400, nonMultipart.body);
        }
        const configuredLimit = DraxConfig.get(CommonConfig.MaxUploadSize);
        try {
            DraxConfig.set(CommonConfig.MaxUploadSize, 32);
            const response = await upload('image.png', 'image/png', png);
            assert.equal(response.statusCode, 413, response.body);
        } finally { DraxConfig.set(CommonConfig.MaxUploadSize, configuredLimit); }
        assert.equal((await FileServiceFactory.instance.fetchAll()).length, metadataBefore);
        assert.deepEqual((await readdir(mediaDir, {recursive: true})).sort(), filesBefore);
    });

    it('returns featured as a boolean in catalog, detail and coupons without resetting it on PATCH', async () => {
        let response = await request('GET', '/api/public/benefits');
        assert.ok(response.json().items.every(item => item.featured === false));
        await benefits.instance.updatePartial(benefit._id, {featured: true});
        await benefits.instance.updatePartial(benefit._id, {title: 'Featured discount'});
        response = await request('GET', '/api/public/benefits');
        assert.equal(response.json().items[0]._id, benefit._id);
        assert.equal(response.json().items[0].featured, true);
        assert.equal(response.json().items.find(item => item._id === otherBenefit._id).featured, false);
        response = await request('GET', `/api/public/benefits/${benefit._id}`);
        assert.equal(response.json().featured, true);
        const coupon = await issue();
        assert.equal(coupon.benefit.featured, true);
        assertSafeCoupon(coupon);
        for (const [path, token] of [[`/api/public/benefit-claims/${coupon.token}`, undefined], [`/api/benefit-claims/${coupon.token}/inspect`, managerToken]]) {
            response = await request('GET', path, undefined, token);
            assert.equal(response.json().benefit.featured, true);
        }
        // Legacy records without the field still expose a boolean read default.
        await mongoose.connection.collection('Benefit').updateOne({_id: new mongoose.Types.ObjectId(benefit._id)}, {$unset: {featured: 1}});
        response = await request('GET', `/api/public/benefits/${benefit._id}`);
        assert.equal(response.json().featured, false);
    });

    it('aggregates all coupons server-side into benefit/company breakdowns without pagination or sensitive data', async t => {
        const thirdBenefit = await benefits.instance.create({...benefit, title: 'Another discount', company: company._id, category: category._id});
        const repository = new BenefitClaimMongoRepository();
        const ids = [...Array(105).fill(benefit._id), ...Array(3).fill(thirdBenefit._id), ...Array(2).fill(otherBenefit._id)];
        await Promise.all(ids.map((id, index) => repository.create({benefit: id, token: (index + 1).toString(16).padStart(64, '0')})));
        for (const index of [1, 2, 106]) await repository.redeem(index.toString(16).padStart(64, '0'), merchantUser._id.toString());
        for (const method of ['paginate', 'fetchAll', 'find'] as const) {
            t.mock.method(claims.instance, method, async () => { throw new Error('Statistics must not fetch coupon lists'); });
        }
        const expected = {
            claims: 110, redeemed: 3, pending: 107,
            byBenefit: [
                {id: thirdBenefit._id, name: thirdBenefit.title, generated: 3, redeemed: 1},
                {id: benefit._id, name: benefit.title, generated: 105, redeemed: 2},
                {id: otherBenefit._id, name: otherBenefit.title, generated: 2, redeemed: 0},
            ],
            byCompany: [
                {id: company._id, name: company.name, generated: 108, redeemed: 3},
                {id: otherCompany._id, name: otherCompany.name, generated: 2, redeemed: 0},
            ],
        };
        for (const token of [managerToken, adminToken]) {
            const response = await request('GET', '/api/benefit-statistics', undefined, token);
            assert.equal(response.statusCode, 200, response.body);
            assert.deepEqual(response.json(), expected);
            assert.ok(!response.body.includes('token'));
            assert.ok(!response.body.includes('redeemedBy'));
            assert.ok(!response.body.includes('contactEmail'));
        }
        assert.equal((await request('GET', '/api/benefit-statistics', undefined, merchantToken)).statusCode, 403);
    });

    it('returns empty breakdown arrays with no coupons and keeps orphaned claims in aggregate totals', async () => {
        let response = await request('GET', '/api/benefit-statistics', undefined, managerToken);
        assert.deepEqual(response.json(), {claims: 0, redeemed: 0, pending: 0, byBenefit: [], byCompany: []});
        await issue();
        await benefits.instance.delete(benefit._id);
        response = await request('GET', '/api/benefit-statistics', undefined, managerToken);
        assert.equal(response.statusCode, 200, response.body);
        assert.deepEqual(response.json(), {
            claims: 1, redeemed: 0, pending: 1,
            byBenefit: [{id: benefit._id, name: '', generated: 1, redeemed: 0}],
            byCompany: [{id: '', name: '', generated: 1, redeemed: 0}],
        });
    });

    it('sets no-store and no-referrer on all coupon responses, including failures', async t => {
        const check = (response, status = 200) => {
            assert.equal(response.statusCode, status, response.body);
            assert.equal(response.headers['cache-control'], 'no-store');
            assert.equal(response.headers['referrer-policy'], 'no-referrer');
        };
        const generated = await request('POST', `/api/benefits/${benefit._id}/claim`);
        check(generated);
        const token = generated.json().token;
        check(await request('GET', `/api/public/benefit-claims/${token}`));
        check(await request('GET', '/api/benefit-claims', undefined, managerToken));
        check(await request('GET', `/api/benefit-claims/${token}/inspect`, undefined, merchantToken));
        check(await request('POST', `/api/benefit-claims/${token}/redeem`, undefined, merchantToken));
        check(await request('POST', `/api/benefit-claims/${token}/redeem`, undefined, merchantToken), 400);
        check(await request('GET', '/api/benefit-claims'), 401);
        check(await request('GET', `/api/benefit-claims/${token}/inspect`, undefined, otherMerchantToken), 403);
        check(await request('GET', `/api/public/benefit-claims/${unknownToken}`), 404);
        check(await request('GET', '/api/public/benefit-claims/invalid'), 422);
        t.mock.method(claims.instance, 'issue', async () => { throw new Error('private-token'); });
        check(await request('POST', `/api/benefits/${benefit._id}/claim`), 500);
    });

    it('rate-limits public issuance per IP without accepting forwarded IP spoofing', async () => {
        for (let i = 0; i < 10; i++) {
            assert.equal((await request('POST', `/api/benefits/${benefit._id}/claim`, undefined, undefined, '198.51.100.20')).statusCode, 200);
        }
        const response = await app.inject({method: 'POST', url: `/api/benefits/${benefit._id}/claim`, remoteAddress: '198.51.100.20', headers: {'x-forwarded-for': '198.51.100.21'}});
        assert.equal(response.statusCode, 429, response.body);
        assert.equal(response.headers['cache-control'], 'no-store');
        assert.equal(response.headers['referrer-policy'], 'no-referrer');
        assert.ok(response.headers['retry-after']);
        assert.equal((await request('POST', `/api/benefits/${benefit._id}/claim`, undefined, undefined, '198.51.100.21')).statusCode, 200);
    });
});

it('media upload size defaults to 5 MiB but preserves explicit Drax configuration', () => {
    const original = DraxConfig.get(CommonConfig.MaxUploadSize);
    const originalEnv = process.env.DRAX_MAX_UPLOAD_SIZE;
    try {
        delete process.env.DRAX_MAX_UPLOAD_SIZE;
        DraxConfig.set(CommonConfig.MaxUploadSize, undefined);
        InitializeMediaConfig();
        assert.equal(DraxConfig.get(CommonConfig.MaxUploadSize), 5 * 1024 * 1024);
        DraxConfig.set(CommonConfig.MaxUploadSize, undefined);
        process.env.DRAX_MAX_UPLOAD_SIZE = '2097152';
        InitializeMediaConfig();
        assert.equal(Number(DraxConfig.get(CommonConfig.MaxUploadSize)), 2097152);
    } finally {
        DraxConfig.set(CommonConfig.MaxUploadSize, original);
        if (originalEnv === undefined) delete process.env.DRAX_MAX_UPLOAD_SIZE;
        else process.env.DRAX_MAX_UPLOAD_SIZE = originalEnv;
    }
});

it('rate limit windows expire and are cleaned up without a background timer', async () => {
    const app = Fastify();
    app.get('/limited', {preHandler: benefitsRateLimit(1, 20)}, async () => ({ok: true}));
    try {
        assert.equal((await app.inject('/limited')).statusCode, 200);
        assert.equal((await app.inject('/limited')).statusCode, 429);
        await new Promise(resolve => setTimeout(resolve, 30));
        assert.equal((await app.inject('/limited')).statusCode, 200);
    } finally { await app.close(); }
});
