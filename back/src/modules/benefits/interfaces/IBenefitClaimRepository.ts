
import type {IBenefitClaim, IBenefitClaimBase} from './IBenefitClaim'
import {IDraxCrudRepository} from "@drax/crud-share";
import type {BenefitStatistics} from '../schemas/PublicBenefitSchema.js';

interface IBenefitClaimRepository extends IDraxCrudRepository<IBenefitClaim, IBenefitClaimBase, IBenefitClaimBase>{
    redeem?(token: string, userId: string): Promise<IBenefitClaim | null>;
    statistics?(): Promise<BenefitStatistics>;
}

export {IBenefitClaimRepository}


