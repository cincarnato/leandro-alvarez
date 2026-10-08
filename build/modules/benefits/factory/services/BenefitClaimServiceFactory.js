import BenefitClaimMongoRepository from '../../repository/mongo/BenefitClaimMongoRepository.js';
import { BenefitClaimService } from '../../services/BenefitClaimService.js';
import { BenefitClaimBaseSchema, BenefitClaimSchema } from '../../schemas/BenefitClaimSchema.js';
import { COMMON, CommonConfig, DraxConfig } from '@drax/common-back';
class BenefitClaimServiceFactory {
    static get instance() {
        if (!this.service) {
            if (DraxConfig.getOrLoad(CommonConfig.DbEngine) !== COMMON.DB_ENGINES.MONGODB) {
                throw new Error('Benefits MVP requires MongoDB for atomic redemption');
            }
            this.service = new BenefitClaimService(new BenefitClaimMongoRepository(), BenefitClaimBaseSchema, BenefitClaimSchema);
        }
        return this.service;
    }
}
export default BenefitClaimServiceFactory;
export { BenefitClaimServiceFactory };
