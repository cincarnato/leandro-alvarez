
import CategoryMongoRepository from '../../repository/mongo/CategoryMongoRepository.js'
import CategorySqliteRepository from '../../repository/sqlite/CategorySqliteRepository.js'
import type {ICategoryRepository} from "../../interfaces/ICategoryRepository";
import {CategoryService} from '../../services/CategoryService.js'
import {CategoryBaseSchema, CategorySchema} from "../../schemas/CategorySchema.js";
import {COMMON, CommonConfig, DraxConfig} from "@drax/common-back";

class CategoryServiceFactory {
    private static service: CategoryService;

    public static get instance(): CategoryService {
        if (!CategoryServiceFactory.service) {
            
            let repository: ICategoryRepository
            switch (DraxConfig.getOrLoad(CommonConfig.DbEngine)) {
                case COMMON.DB_ENGINES.MONGODB:
                    repository = new CategoryMongoRepository()
                    break;
                case COMMON.DB_ENGINES.SQLITE:
                    const dbFile = DraxConfig.getOrLoad(CommonConfig.SqliteDbFile)
                    repository = new CategorySqliteRepository(dbFile, false)
                    repository.build()
                    break;
                default:
                    throw new Error("DraxConfig.DB_ENGINE must be one of " + Object.values(COMMON.DB_ENGINES).join(", "));
            }
            
            const baseSchema = CategoryBaseSchema;
            const fullSchema = CategorySchema;
            CategoryServiceFactory.service = new CategoryService(repository, baseSchema, fullSchema);
        }
        return CategoryServiceFactory.service;
    }
}

export default CategoryServiceFactory
export {
    CategoryServiceFactory
}

