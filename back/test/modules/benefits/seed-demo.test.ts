import {after, before, beforeEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, isAbsolute, join, resolve, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import {CommonConfig, DraxConfig, mongoose} from '@drax/common-back';
import {FileServiceFactory} from '@drax/media-back';
import MongoInMemory from '../../setup/MongoInMemory.js';
import {seedBenefitsDemo} from '../../../src/setup/scripts/SeedBenefitsDemo.js';
import {demoCategories, demoCompanies, demoBenefits} from '../../../src/setup/data/benefits-demo.js';
import CompanyServiceFactory from '../../../src/modules/benefits/factory/services/CompanyServiceFactory.js';
import CategoryServiceFactory from '../../../src/modules/benefits/factory/services/CategoryServiceFactory.js';
import BenefitServiceFactory from '../../../src/modules/benefits/factory/services/BenefitServiceFactory.js';
import BenefitsMediaRoutes from '../../../src/modules/benefits/routes/BenefitsMediaRoutes.js';
import BenefitsRoutes from '../../../src/modules/benefits/routes/BenefitsRoutes.js';
import {assertRasterImage} from '../../../src/modules/benefits/services/RasterImageUpload.js';
import {rasterFixtures} from './raster-fixtures.js';

const backRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const assetsDir = join(backRoot, 'assets/demo/logos');
const baseUrl = 'https://benefits-seed.example.test';
const day = 24 * 60 * 60 * 1000;
const createdSummary = {
    categories: {created: 8, reused: 0}, companies: {created: 10, reused: 0}, benefits: {created: 12, updated: 0},
};
const repeatedSummary = {
    categories: {created: 0, reused: 8}, companies: {created: 0, reused: 10}, benefits: {created: 0, updated: 12},
};
const run = promisify(execFile);

// node --test isolates this file's Drax singletons/environment from the other benefits suites.
describe('Benefits demo seed: isolated MongoInMemory and temporary Media storage', {concurrency: false}, () => {
    const mongo = new MongoInMemory();
    const app = Fastify();
    let tempRoot: string;
    let mediaDir: string;
    let now: Date;
    const envKeys = ['DRAX_DB_ENGINE', 'DRAX_FILE_METADATA', 'DRAX_MAX_UPLOAD_SIZE'];
    const originalEnv = new Map(envKeys.map(key => [key, process.env[key]]));
    const configKeys = [CommonConfig.DbEngine, CommonConfig.FileDir, CommonConfig.BaseUrl, CommonConfig.MaxUploadSize];
    const originalConfig = new Map(configKeys.map(key => [key, DraxConfig.get(key)]));

    async function records(name: string) {
        return mongoose.connection.collection(name).find({}).sort({_id: 1}).toArray();
    }

    async function diskFiles(dir = mediaDir): Promise<string[]> {
        const entries = await readdir(dir, {withFileTypes: true});
        const files = await Promise.all(entries.map(entry => entry.isDirectory()
            ? diskFiles(join(dir, entry.name)) : Promise.resolve([join(dir, entry.name)])));
        return files.flat().sort();
    }

    async function assertCounts(categories = 8, companies = 10, benefits = 12, files = 10) {
        for (const [name, count] of [['Category', categories], ['Company', companies], ['Benefit', benefits], ['File', files]] as const) {
            assert.equal(await mongoose.connection.collection(name).countDocuments(), count, name);
        }
        assert.equal((await diskFiles()).length, 10);
        for (const name of ['User', 'BenefitClaim']) {
            assert.equal(await mongoose.connection.collection(name).countDocuments(), 0, `${name}: seed must not generate identities/coupons`);
        }
    }

    async function identitySnapshot() {
        return Promise.all(['Category', 'Company', 'Benefit', 'File'].map(async name => ({
            name, ids: (await records(name)).map(record => record._id.toString()),
        })));
    }

    async function assertDemo(expectedNow: Date) {
        const categories = await records('Category');
        const companies = await records('Company');
        const benefits = await records('Benefit');
        assert.equal(demoCategories.length, 8);
        assert.equal(demoCompanies.length, 10);
        assert.equal(demoBenefits.length, 12);
        const usedCategories = new Set<string>();
        const usedCompanies = new Set<string>();
        for (const expected of demoCategories) {
            const category = categories.find(record => record.name === expected.name);
            assert.ok(category, expected.name);
            assert.equal(category.description, expected.description);
        }
        for (const expected of demoCompanies) {
            const company = companies.find(record => record.name === expected.name);
            assert.ok(company, expected.name);
            assert.equal(company.description, expected.description);
            assert.equal(company.active, true);
            const url = new URL(company.logo);
            assert.equal(url.origin, baseUrl);
            assert.match(url.pathname, /^\/api\/file\/demo-logos\/\d{4}\/\d{2}\/.+\.png$/);
            const bytes = await readFile(join(assetsDir, expected.logo));
            assert.doesNotThrow(() => assertRasterImage(bytes, expected.logo, 'image/png'));
            assert.deepEqual(bytes.subarray(0, 8), rasterFixtures[0].bytes.subarray(0, 8));
            const metadata = await FileServiceFactory.instance.findOneBy('url', company.logo);
            assert.ok(metadata, `${expected.name}: real Media metadata`);
            assert.equal(metadata.mimetype, 'image/png');
            assert.equal(metadata.size, bytes.length);
            const storedPath = resolve(metadata.relativePath);
            const localPath = relative(mediaDir, storedPath);
            assert.ok(localPath && !localPath.startsWith('..') && !isAbsolute(localPath));
            assert.deepEqual(await readFile(storedPath), bytes);
            const download = await app.inject({method: 'GET', url: url.pathname});
            assert.equal(download.statusCode, 200, download.body);
            assert.match(String(download.headers['content-type']), /^image\/png/);
            assert.equal(download.headers['x-content-type-options'], 'nosniff');
            assert.deepEqual(download.rawPayload, bytes);
        }
        for (const expected of demoBenefits) {
            const benefit = benefits.find(record => record.title === expected.title);
            assert.ok(benefit, expected.title);
            const companyName = demoCompanies.find(company => company.key === expected.company)!.name;
            const categoryName = demoCategories.find(category => category.key === expected.category)!.name;
            const company = companies.find(record => record.name === companyName)!;
            const category = categories.find(record => record.name === categoryName)!;
            assert.equal(benefit.company.toString(), company._id.toString());
            assert.equal(benefit.category.toString(), category._id.toString());
            usedCompanies.add(company._id.toString());
            usedCategories.add(category._id.toString());
            assert.equal(benefit.image, company.logo);
            assert.equal(benefit.description, expected.description);
            assert.equal(benefit.conditions, expected.conditions);
            assert.equal(benefit.active, true);
            assert.equal(benefit.featured, expected.featured);
            assert.equal(benefit.startDate.getTime(), expectedNow.getTime() - day);
            assert.equal(benefit.endDate.getTime(), expectedNow.getTime() + 90 * day);
            assert.ok(benefit.startDate <= expectedNow && benefit.endDate > expectedNow);
        }
        assert.equal(usedCategories.size, 8);
        assert.equal(usedCompanies.size, 10);
        const catalog = await app.inject({method: 'GET', url: '/api/public/benefits'});
        assert.equal(catalog.statusCode, 200, catalog.body);
        assert.equal(catalog.json().items.length, 12);
        assert.equal(catalog.json().items.filter(benefit => benefit.featured).length, 4);
    }

    before(async () => {
        process.env.DRAX_DB_ENGINE = 'mongo';
        process.env.DRAX_FILE_METADATA = 'true';
        delete process.env.DRAX_MAX_UPLOAD_SIZE;
        tempRoot = await mkdtemp(join(tmpdir(), 'benefits-seed-test-'));
        mediaDir = join(tempRoot, 'media');
        await mkdir(mediaDir);
        DraxConfig.set(CommonConfig.DbEngine, 'mongo');
        DraxConfig.set(CommonConfig.FileDir, mediaDir);
        DraxConfig.set(CommonConfig.BaseUrl, baseUrl);
        DraxConfig.set(CommonConfig.MaxUploadSize, undefined);
        assert.equal(mongoose.connection.readyState, 0, 'never reuse an existing database connection');
        await mongo.connect();
        app.setValidatorCompiler(() => () => true); // Same compiler as benefits-mvp and the production Drax server.
                app.register(fastifyStatic, {root: mediaDir, serve: false});
        app.register(BenefitsMediaRoutes);
        app.register(BenefitsRoutes);
        await app.ready();
    });

    beforeEach(async () => {
        // Fixture cleanup is confined to this file's in-memory database and temporary directory.
        for (const name of ['BenefitClaim', 'Benefit', 'Category', 'Company', 'File', 'User']) {
            await mongoose.connection.collection(name).deleteMany({});
        }
        await rm(mediaDir, {recursive: true, force: true});
        await mkdir(mediaDir);
        process.env.DRAX_FILE_METADATA = 'true';
        DraxConfig.set(CommonConfig.MaxUploadSize, undefined);
        now = new Date();
    });

    after(async () => {
        try {
            await app.close();
            await mongo.dropAndClose();
        } finally {
            if (tempRoot) await rm(tempRoot, {recursive: true, force: true});
            for (const [key, value] of originalEnv) {
                if (value === undefined) delete process.env[key];
                else process.env[key] = value;
            }
            for (const [key, value] of originalConfig) DraxConfig.set(key, value);
        }
    });

    it('creates exactly 8/10/12, uses every category/company and serves ten genuine local PNG logos', async () => {
        assert.deepEqual(await seedBenefitsDemo({now, assetsDir}), createdSummary);
        assert.equal(Number(DraxConfig.get(CommonConfig.MaxUploadSize)), 5 * 1024 * 1024,
            'seed initializes the default upload limit without test-side initialization');
        await assertCounts();
        await assertDemo(now);
    });

    it('reuses IDs and ten files on repeat, updates twelve benefits and renews dates for ninety days', async () => {
        const initial = new Date(now.getTime() - 2 * day);
        assert.deepEqual(await seedBenefitsDemo({now: initial, assetsDir}), createdSummary);
        const identities = await identitySnapshot();
        const files = await diskFiles();
        const logos = (await records('Company')).map(company => company.logo);
        assert.deepEqual(await seedBenefitsDemo({now: initial, assetsDir}), repeatedSummary);
        const renewed = now;
        assert.deepEqual(await seedBenefitsDemo({now: renewed, assetsDir}), repeatedSummary);
        assert.deepEqual(await identitySnapshot(), identities);
        assert.deepEqual(await diskFiles(), files);
        assert.deepEqual((await records('Company')).map(company => company.logo), logos);
        await assertCounts();
        await assertDemo(renewed);
    });

    it('preserves real unprefixed records, their dates/flags and all other persisted fields', async () => {
        const category = await CategoryServiceFactory.instance.create({name: 'Hogar', description: 'Categoría real'});
        const company = await CompanyServiceFactory.instance.create({name: 'Casa Nativa', description: 'Comercio real',
            logo: 'https://real.example.test/logo.png', active: false, contactEmail: 'real@example.test'});
        const benefit = await BenefitServiceFactory.instance.create({
            title: demoBenefits[0].title.replace(/^Demo · /, ''), description: 'Beneficio real',
            company: company._id, category: category._id, image: 'https://real.example.test/benefit.png',
            conditions: 'Condiciones reales', active: false, featured: true,
            startDate: new Date('2020-01-01T00:00:00Z'), endDate: new Date('2020-02-01T00:00:00Z'),
        });
        const realIds = [category._id, company._id, benefit._id];
        const snapshot = async () => Promise.all(['Category', 'Company', 'Benefit'].map(async (name, index) =>
            JSON.stringify(await mongoose.connection.collection(name).findOne({_id: new mongoose.Types.ObjectId(realIds[index])}))));
        const original = await snapshot();
        assert.deepEqual(await seedBenefitsDemo({now, assetsDir}), createdSummary);
        assert.deepEqual(await seedBenefitsDemo({now: new Date(now.getTime() + day), assetsDir}), repeatedSummary);
        assert.deepEqual(await snapshot(), original);
        await assertCounts(9, 11, 13);
    });

    it('preflights every logo before creating any demo record or uploaded file', async () => {
        const incompleteAssets = join(tempRoot, 'missing-logo');
        await mkdir(incompleteAssets);
        // Missing the final asset proves that validation does not interleave with writes.
        for (const company of demoCompanies.slice(0, -1)) {
            await writeFile(join(incompleteAssets, company.logo), rasterFixtures[0].bytes);
        }
        await assert.rejects(seedBenefitsDemo({now, assetsDir: incompleteAssets}), {code: 'ENOENT'});
        for (const name of ['Category', 'Company', 'Benefit', 'File', 'User', 'BenefitClaim']) {
            assert.equal(await mongoose.connection.collection(name).countDocuments(), 0, name);
        }
        assert.deepEqual(await diskFiles(), []);
    });

    it('also repeats without duplicate uploads when Media metadata is disabled', async () => {
        process.env.DRAX_FILE_METADATA = 'false';
        assert.deepEqual(await seedBenefitsDemo({now, assetsDir}), createdSummary);
        const identities = await identitySnapshot();
        const files = await diskFiles();
        assert.deepEqual(await seedBenefitsDemo({now, assetsDir}), repeatedSummary);
        assert.deepEqual(await identitySnapshot(), identities);
        assert.deepEqual(await diskFiles(), files);
        await assertCounts(8, 10, 12, 0);
        for (const company of await records('Company')) {
            const download = await app.inject({method: 'GET', url: new URL(company.logo).pathname});
            assert.equal(download.statusCode, 200, download.body);
            assert.doesNotThrow(() => assertRasterImage(download.rawPayload, 'logo.png', 'image/png'));
        }
        assert.equal(await mongoose.connection.collection('File').countDocuments(), 0);
    });

    it('runs the source CLI and package runner in bounded child processes against unique temporary databases', {timeout: 45_000}, async () => {
        const cliRoot = join(tempRoot, 'cli');
        await mkdir(cliRoot);
        await cp(join(backRoot, 'assets'), join(cliRoot, 'assets'), {recursive: true});
        for (const [index, args] of [
            ['--import', import.meta.resolve('tsx'), join(backRoot, 'src/setup/scripts/SeedBenefitsDemo.ts')],
            [join(backRoot, 'scripts/seed-demo.mjs')],
        ].entries()) {
            const dbName = `seed_demo_cli_${index}`;
            const fileDir = join(cliRoot, `files-${index}`);
            const result = await run(process.execPath, args, {
                cwd: cliRoot, timeout: 18_000, maxBuffer: 1024 * 1024,
                // No inherited DB configuration, NODE_OPTIONS or --env-file; only this in-memory URI.
                env: {PATH: process.env.PATH, HOME: process.env.HOME, NODE_ENV: 'test',
                    DRAX_DB_ENGINE: 'mongo', DRAX_MONGO_URI: mongo.mongoServer.getUri(dbName),
                    DRAX_FILE_DIR: fileDir, DRAX_FILE_METADATA: 'true', DRAX_BASE_URL: baseUrl},
            });
            assert.match(result.stdout, /Demo lista: 8 categorías, 10 comercios y 12 beneficios/);
            const db = mongoose.connection.getClient().db(dbName);
            try {
                for (const [name, count] of [['Category', 8], ['Company', 10], ['Benefit', 12], ['File', 10], ['User', 0], ['BenefitClaim', 0]] as const) {
                    assert.equal(await db.collection(name).countDocuments(), count, `${index}: ${name}`);
                }
                assert.equal((await diskFiles(fileDir)).length, 10);
                for (const company of await db.collection('Company').find({}).toArray()) {
                    assert.ok(company.logo.startsWith(`${baseUrl}/api/file/demo-logos/`));
                }
            } finally {
                await db.dropDatabase();
            }
        }
        assert.equal(await mongoose.connection.collection('Benefit').countDocuments(), 0,
            'CLI must not seed the parent test database');
    });
});
