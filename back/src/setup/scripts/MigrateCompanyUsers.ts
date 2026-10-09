import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {CommonConfig, DraxConfig, LoadCommonConfigFromEnv, mongoose} from '@drax/common-back';
import CompanyMembershipMigrationRepository from '../../modules/benefits/repository/mongo/CompanyMembershipMigrationRepository.js';

export async function runMigrateCompanyUsers() {
    LoadCommonConfigFromEnv();
    if (DraxConfig.getOrLoad(CommonConfig.DbEngine) !== 'mongo') {
        throw new Error('La migración requiere DRAX_DB_ENGINE=mongo.');
    }
    const uri = DraxConfig.getOrLoad(CommonConfig.MongoDbUri);
    if (typeof uri !== 'string' || !uri.trim()) {
        throw new Error('Falta DRAX_MONGO_URI en el entorno del servidor.');
    }
    try {
        await mongoose.connect(uri, {serverSelectionTimeoutMS: 10000});
        const summary = await new CompanyMembershipMigrationRepository().migrate();
        console.table(summary);
        if (summary.missingCompanies || summary.invalidCompanyReferences) {
            console.warn('Se omitieron referencias inexistentes o inválidas. Revisarlas antes de dar la migración por verificada.');
        }
        console.info('User.company se conserva sin cambios; no eliminarlo hasta completar la verificación manual.');
        return summary;
    } finally {
        await mongoose.disconnect();
    }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        await runMigrateCompanyUsers();
    } catch {
        // Database exceptions can include connection credentials; do not log the raw error or URI.
        console.error('No se pudo completar la migración. Revisá DRAX_DB_ENGINE=mongo, DRAX_MONGO_URI, conectividad, permisos y que Company.users sea un array. Se puede reintentar sin duplicar membresías.');
        process.exitCode = 1;
    }
}
