import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Readable} from 'node:stream';
import {CommonConfig, DraxConfig, LoadCommonConfigFromEnv, mongoose} from '@drax/common-back';
import {MediaService} from '@drax/media-back';
import CompanyServiceFactory from '../../modules/benefits/factory/services/CompanyServiceFactory.js';
import CategoryServiceFactory from '../../modules/benefits/factory/services/CategoryServiceFactory.js';
import BenefitServiceFactory from '../../modules/benefits/factory/services/BenefitServiceFactory.js';
import {assertRasterImage, rasterUploadSizeLimit} from '../../modules/benefits/services/RasterImageUpload.js';
import InitializeMediaConfig from '../InitializeMediaConfig.js';
import {demoCategories, demoCompanies, demoBenefits} from '../data/benefits-demo.js';
import type {ICompany} from '../../modules/benefits/interfaces/ICompany.js';

export async function seedBenefitsDemo({now = new Date(), assetsDir = resolve('assets/demo/logos')} = {}) {
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) !== 'mongo') {
        throw new Error('El seed de beneficios requiere DRAX_DB_ENGINE=mongo.');
    }
    if (!Number.isFinite(now.getTime())) throw new Error('La fecha de la demo no es válida.');
    InitializeMediaConfig();

    // Check every asset before creating records so a missing deployment asset cannot leave a partial demo.
    const logos = new Map<string, Buffer>();
    for (const company of demoCompanies) {
        const bytes = await readFile(resolve(assetsDir, company.logo));
        assertRasterImage(bytes, company.logo, 'image/png');
        if (bytes.length > rasterUploadSizeLimit()) throw new Error(`El logo ${company.logo} supera DRAX_MAX_UPLOAD_SIZE.`);
        logos.set(company.key, bytes);
    }

    const summary = {
        categories: {created: 0, reused: 0},
        companies: {created: 0, reused: 0},
        benefits: {created: 0, updated: 0},
    };
    const categories = new Map<string, string>();
    const companies = new Map<string, ICompany>();
    const media = new MediaService();

    for (const {key, name, description} of demoCategories) {
        let category = await CategoryServiceFactory.instance.findOneBy('name', name);
        if (category) summary.categories.reused++;
        else {
            category = await CategoryServiceFactory.instance.create({name, description});
            summary.categories.created++;
        }
        categories.set(key, category._id);
    }

    for (const {key, name, description, logo} of demoCompanies) {
        let company = await CompanyServiceFactory.instance.findOneBy('name', name);
        let storedFile: Awaited<ReturnType<MediaService['saveFile']>> | undefined;
        try {
            if (!company?.logo) {
                storedFile = await media.saveFile({
                    dir: 'demo-logos', date: now,
                    file: {filename: logo, fileStream: Readable.from(logos.get(key)!), mimetype: 'image/png', encoding: '7bit'},
                });
            }
            if (company) {
                company = await CompanyServiceFactory.instance.updatePartial(company._id, {
                    active: true, ...(storedFile ? {logo: storedFile.url} : {}),
                });
                summary.companies.reused++;
            } else {
                company = await CompanyServiceFactory.instance.create({name, description, logo: storedFile!.url, active: true});
                summary.companies.created++;
            }
        } catch (error) {
            // Do not leave an orphan upload if the domain record could not be saved.
            if (storedFile) await media.deleteFileByRelativePath({relativePath: storedFile.relativePath}).catch(() => undefined);
            throw error;
        }
        companies.set(key, company);
    }

    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    for (const benefit of demoBenefits) {
        const company = companies.get(benefit.company)!;
        const category = categories.get(benefit.category)!;
        const data = {...benefit, company: company._id, category, image: company.logo, startDate, endDate, active: true};
        const existing = await BenefitServiceFactory.instance.findOneBy('title', benefit.title, [
            {field: 'company', operator: 'eq', value: company._id},
            {field: 'category', operator: 'eq', value: category},
        ]);
        if (existing) {
            await BenefitServiceFactory.instance.updatePartial(existing._id, data);
            summary.benefits.updated++;
        } else {
            await BenefitServiceFactory.instance.create(data);
            summary.benefits.created++;
        }
    }
    return summary;
}

export async function runSeedBenefitsDemo() {
    LoadCommonConfigFromEnv();
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) !== 'mongo') {
        throw new Error('El seed de beneficios requiere DRAX_DB_ENGINE=mongo.');
    }
    const uri = DraxConfig.getOrLoad(CommonConfig.MongoDbUri);
    if (!uri) throw new Error('Falta DRAX_MONGO_URI en el entorno del servidor.');
    try {
        // A one-off command must fail promptly rather than install the server connector's retry timers.
        await mongoose.connect(uri, {serverSelectionTimeoutMS: 10000});
        console.info('Cargando demo en la base configurada. No se borrarán registros existentes.');
        const summary = await seedBenefitsDemo();
        console.table(summary);
        console.info('Demo lista: 8 categorías, 10 comercios y 12 beneficios. Vigencia renovada por 90 días.');
    } finally {
        await mongoose.disconnect();
    }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try { await runSeedBenefitsDemo(); }
    catch (error) {
        // Never print a connection URI or raw database exception (which may carry credentials).
        if (error instanceof Error && error.name === 'MongooseServerSelectionError') {
            console.error('No se pudo conectar a MongoDB. Revisá DRAX_MONGO_URI y el acceso a la base.');
        } else {
            console.error('No se pudo completar el seed de demo. Revisá configuración, assets y permisos de escritura.');
        }
        process.exitCode = 1;
    }
}
