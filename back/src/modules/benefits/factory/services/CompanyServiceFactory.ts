
import CompanyMongoRepository from '../../repository/mongo/CompanyMongoRepository.js'
import CompanySqliteRepository from '../../repository/sqlite/CompanySqliteRepository.js'
import type {ICompanyRepository} from "../../interfaces/ICompanyRepository";
import {CompanyService} from '../../services/CompanyService.js'
import {CompanyBaseSchema, CompanySchema} from "../../schemas/CompanySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CompanyServiceFactory {
    private static service: CompanyService;

    public static get instance(): CompanyService {
        if (!CompanyServiceFactory.service) {
            
            let repository: ICompanyRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CompanyMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CompanySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CompanyBaseSchema;
            const fullSchema = CompanySchema;
            CompanyServiceFactory.service = new CompanyService(repository, baseSchema, fullSchema);
        }
        return CompanyServiceFactory.service;
    }
}

export default CompanyServiceFactory
export {
    CompanyServiceFactory
}

