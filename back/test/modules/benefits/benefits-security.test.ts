import {it} from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import pino from 'pino';
import FastifyServer from '../../../src/servers/FastifyServer.js';
import {redactLogUrl} from '../../../src/servers/RedactLogUrl.js';
import {assertRasterImage, rasterUploadSizeLimit, MAX_RASTER_UPLOAD_SIZE} from '../../../src/modules/benefits/services/RasterImageUpload.js';
import {CommonConfig, DraxConfig} from '@drax/common-back';
import {rasterFixtures} from './raster-fixtures.js';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import BenefitsController from '../../../src/modules/benefits/controllers/BenefitsController.js';

it('redacts coupon path tokens and all query values, including encoded/invalid tokens and nested sensitive queries', () => {
    const token = 'a'.repeat(64);
    for (const [url, expected] of [
        [`/api/public/benefit-claims/${token}`, '/api/public/benefit-claims/[REDACTED]'],
        [`/api/benefit-claims/${token}/inspect?password=private`, '/api/benefit-claims/[REDACTED]/inspect?[REDACTED]'],
        [`/api/benefit-claims/${token}/redeem?token=private&api_key=secret`, '/api/benefit-claims/[REDACTED]/redeem?[REDACTED]'],
        ['/api/public/benefit-claims/invalid%2Ftoken%3Fsecret', '/api/public/benefit-claims/[REDACTED]'],
        ['/api/benefit-claims/invalid/redeem', '/api/benefit-claims/[REDACTED]/redeem'],
        [`/%61pi/%70ublic/benefit%2Dclaims/${token}`, '/%61pi/%70ublic/benefit%2Dclaims/[REDACTED]'],
        [`/api/benefit-claims?filters=token;eq;${token}|redeemedAt;empty;`, '/api/benefit-claims?[REDACTED]'],
        [`/api/public/benefits?%74oken=${token}&redirect=/api/public/benefit-claims/${token}`, '/api/public/benefits?[REDACTED]'],
        ['/api/benefit-claims?page=1&limit=10', '/api/benefit-claims?[REDACTED]'],
        ['/api/benefit-claims', '/api/benefit-claims'],
        [`/coupons/${token}`, '/coupons/[REDACTED]'],
        ['/status', '/status'],
    ]) assert.equal(redactLogUrl(url), expected);
    assert.equal(redactLogUrl(undefined), undefined);
    assert.equal(redactLogUrl(null), undefined);
});

it('production Fastify request AND response serializers never log coupon tokens or secret query values', async () => {
    const logs: any[] = [];
    const loggerInstance = pino(FastifyServer.prototype.logger(), {write: line => { logs.push(JSON.parse(line)); }});
    const app = Fastify({loggerInstance});
    const token = 'b'.repeat(64);
    app.get('/api/public/benefit-claims/:token', async (_request, reply) => reply.code(404).send({error: 'not_found'}));
    app.get('/api/benefit-claims/:token/inspect', async (_request, reply) => reply.code(403).send({error: 'forbidden'}));
    app.post('/api/benefit-claims/:token/redeem', async (_request, reply) => reply.code(400).send({error: 'invalid'}));
    app.get('/coupons/:token', async () => ({ok: true}));
    try {
        for (const [method, url] of [
            ['GET', `/api/public/benefit-claims/${token}?token=secret-query&password=private-password`],
            ['GET', `/api/benefit-claims/${token}/inspect?filters=token;eq;secret-filter`],
            ['POST', `/api/benefit-claims/${token}/redeem?access_token=secret-access&apiKey=secret-key`],
            ['GET', `/coupons/${token}?token=secret-query`],
        ] as const) await app.inject({method, url});
        assert.equal(logs.filter(log => log.req).length, 4);
        assert.equal(logs.filter(log => log.res).length, 4);
        for (const log of logs) {
            const serialized = JSON.stringify(log);
            for (const secret of [token, 'secret-query', 'private-password', 'secret-filter', 'secret-access', 'secret-key']) {
                assert.ok(!serialized.includes(secret), serialized);
            }
            const route = log.req?.route ?? log.res?.route;
            assert.ok(route.includes('[REDACTED]'), serialized);
            assert.ok(route.endsWith('?[REDACTED]'), serialized);
        }
    } finally { await app.close(); }
});

it('unexpected benefits errors log only a static message and allowlisted name, never error data', async () => {
    const logs: any[] = [];
    const loggerInstance = pino(FastifyServer.prototype.logger(), {write: line => { logs.push(JSON.parse(line)); }});
    const app = Fastify({loggerInstance});
    const secret = 'private-coupon-and-credentials';
    const error = Object.assign(new Error(secret, {cause: new Error(secret)}), {
        name: 'MongoServerError', keyValue: {token: secret},
    });
    const controller = new BenefitsController();
    const thrown = [error, {...error, name: secret}, null, secret];
    app.post('/failure', (request, reply) => controller.execute(request, reply, async () => { throw thrown.shift(); }));
    try {
        for (let i = 0; i < 4; i++) {
            const response = await app.inject({method: 'POST', url: '/failure'});
            assert.equal(response.statusCode, 500);
            assert.deepEqual(response.json(), {error: 'error.server'});
        }
        const errors = logs.filter(log => log.level === 'error');
        assert.equal(errors.length, 4);
        assert.deepEqual(errors.map(log => log.errorName), ['MongoServerError', 'Error', 'Error', 'Error']);
        for (const log of errors) {
            assert.equal(log.message, 'Unexpected benefits error');
            for (const field of ['err', 'stack', 'cause', 'keyValue']) assert.ok(!(field in log));
        }
        assert.ok(!JSON.stringify(logs).includes(secret));
    } finally { await app.close(); }
});

it('production web fallback returns JSON 404 for unknown API requests and preserves SPA routes', async () => {
    class WebServer extends FastifyServer {
        get app() { return this.fastifyServer; }
        logger() { return {...super.logger(), level: 'silent'}; }
    }
    const root = await mkdtemp(resolve('test/.benefits-web-'));
    let server: WebServer;
    try {
        await mkdir(join(root, 'public'));
        await writeFile(join(root, 'public/index.html'), '<!doctype html><title>SPA fixture</title>');
        server = new WebServer(root);
        for (const method of ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const) {
            for (const url of ['/api', '/api?token=secret', '/api/unknown', '/api/benefit-claims', '/api/benefit-claims/export', '/api/benefitclaim/token?token=secret']) {
                const response = await server.app.inject({method, url});
                assert.equal(response.statusCode, 404, `${method} ${url}: ${response.body}`);
                assert.match(response.headers['content-type'], /application\/json/);
                if (method !== 'HEAD') {
                    assert.ok(response.json().error);
                    assert.ok(!response.body.includes('secret'));
                }
            }
        }
        for (const url of ['/dashboard', '/coupons/token', '/apiary', '/dashboard?redirect=/api/missing']) {
            const response = await server.app.inject({method: 'GET', url});
            assert.equal(response.statusCode, 200, response.body);
            assert.match(response.headers['content-type'], /text\/html/);
            assert.match(response.body, /SPA fixture/);
        }
    } finally {
        await server?.app.close();
        await rm(root, {recursive: true, force: true});
    }
});

it('production error handler preserves Fastify parsing errors as 4xx for bodyless coupon POSTs', async () => {
    const app = Fastify();
    FastifyServer.prototype.setupErrorHandler.call({fastifyServer: app});
    let handled = 0;
    app.post('/api/benefits/:id/claim', async () => { handled++; return {issued: true}; });
    app.post('/api/benefit-claims/:token/redeem', async () => { handled++; return {redeemed: true}; });
    try {
        for (const url of ['/api/benefits/benefit/claim', '/api/benefit-claims/token/redeem']) {
            const emptyJson = await app.inject({method: 'POST', url, headers: {'content-type': 'application/json'}});
            assert.equal(emptyJson.statusCode, 400);
            assert.deepEqual(emptyJson.json(), {error: 'FST_ERR_CTP_EMPTY_JSON_BODY'});
            const invalidJson = await app.inject({method: 'POST', url, headers: {'content-type': 'application/json'}, payload: '{'});
            assert.equal(invalidJson.statusCode, 400);
            assert.match(invalidJson.json().error, /^FST_ERR_CTP_/);
            assert.equal(handled, url.includes('/redeem') ? 1 : 0);
            const noBody = await app.inject({method: 'POST', url});
            assert.equal(noBody.statusCode, 200, noBody.body);
        }
        assert.equal(handled, 2);
        const unsupported = await app.inject({method: 'POST', url: '/api/benefits/benefit/claim', headers: {'content-type': 'application/xml'}, payload: '<claim />'});
        assert.equal(unsupported.statusCode, 415);
        assert.deepEqual(unsupported.json(), {error: 'FST_ERR_CTP_INVALID_MEDIA_TYPE'});
        assert.equal(handled, 2);
    } finally { await app.close(); }
});

it('raster validator checks matching MIME, extension and binary signatures/structure for all four formats', () => {
    for (const fixture of rasterFixtures) {
        assert.doesNotThrow(() => assertRasterImage(fixture.bytes, fixture.filename, fixture.mimetype));
        assert.throws(() => assertRasterImage(fixture.bytes.subarray(0, 12), fixture.filename, fixture.mimetype), {name: 'UploadFileError'});
        assert.throws(() => assertRasterImage(Buffer.from('<script>alert(1)</script>'), fixture.filename, fixture.mimetype), {name: 'UploadFileError'});
    }
    const png = rasterFixtures[0].bytes;
    const fakeGif = Buffer.concat([rasterFixtures[3].bytes.subarray(0, 13), Buffer.from('<script>alert(1)</script>,data;')]);
    assert.throws(() => assertRasterImage(fakeGif, 'image.gif', 'image/gif'), {name: 'UploadFileError'});
    assert.doesNotThrow(() => assertRasterImage(png, 'IMAGE.PNG', 'image/png'));
    assert.doesNotThrow(() => assertRasterImage(rasterFixtures[1].bytes, 'image.jpeg', 'image/jpeg'));
    assert.throws(() => assertRasterImage(png, 'image.jpg', 'image/jpeg'), {name: 'UploadFileError'});
    assert.throws(() => assertRasterImage(png, 'image.svg', 'image/png'), {name: 'UploadFileError'});
    assert.throws(() => assertRasterImage(png, 'image.png', 'image/svg+xml'), {name: 'UploadFileError'});
    assert.throws(() => assertRasterImage(Buffer.concat([png, Buffer.from('<script>alert(1)</script>')]), 'image.png', 'image/png'), {name: 'UploadFileError'});
});

it('multipart/storage raster size cap is 5 MiB and honors smaller configured limits', () => {
    const original = DraxConfig.get(CommonConfig.MaxUploadSize);
    try {
        for (const value of [10 * MAX_RASTER_UPLOAD_SIZE, 0, 'invalid']) {
            DraxConfig.set(CommonConfig.MaxUploadSize, value);
            assert.equal(rasterUploadSizeLimit(), MAX_RASTER_UPLOAD_SIZE);
            assert.equal(Reflect.get(FastifyServer.prototype, 'getFileSizeLimit'), MAX_RASTER_UPLOAD_SIZE);
        }
        DraxConfig.set(CommonConfig.MaxUploadSize, 1024);
        assert.equal(rasterUploadSizeLimit(), 1024);
    } finally { DraxConfig.set(CommonConfig.MaxUploadSize, original); }
});
