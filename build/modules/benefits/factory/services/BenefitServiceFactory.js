import BenefitMongoRepository from '../../repository/mongo/BenefitMongoRepository.js';
import BenefitSqliteRepository from '../../repository/sqlite/BenefitSqliteRepository.js';
import { BenefitService } from '../../services/BenefitService.js';
import { BenefitBaseSchema, BenefitSchema } from "../../schemas/BenefitSchema.js";
import { COMMON, CommonConfig, DraxConfig } from "@drax/common-back";
class BenefitServiceFactory {
    static get instance() {
        if (!BenefitServiceFactory.service) {
            let repository;
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new BenefitMongoRepository();
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile);
                    repository = new BenefitSqliteRepository(dbFile, false);
                    repository.build();
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            const baseSchema = BenefitBaseSchema;
            const fullSchema = BenefitSchema;
            BenefitServiceFactory.service = new BenefitService(repository, baseSchema, fullSchema);
        }
        return BenefitServiceFactory.service;
    }
}
export default BenefitServiceFactory;
export { BenefitServiceFactory };
