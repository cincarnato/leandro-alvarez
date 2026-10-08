import {AbstractMongoRepository} from '@drax/crud-back';
import {BenefitClaimModel} from '../../models/BenefitClaimModel.js';
import {BenefitModel} from '../../models/BenefitModel.js';
import {CompanyModel} from '../../models/CompanyModel.js';
import type {BenefitStatistics} from '../../schemas/PublicBenefitSchema.js';
import type {IBenefitClaimRepository} from '../../interfaces/IBenefitClaimRepository.js';
import type {IBenefitClaim, IBenefitClaimBase} from '../../interfaces/IBenefitClaim.js';

class BenefitClaimMongoRepository extends AbstractMongoRepository<IBenefitClaim, IBenefitClaimBase, IBenefitClaimBase> implements IBenefitClaimRepository {
    constructor() {
        super();
        this._model = BenefitClaimModel;
        this._searchFields = ['token'];
        // Never populate a User: the coupon must not carry identity/contact data.
        this._populateFields = [{path: 'benefit', populate: [{path: 'company'}, {path: 'category'}]}];
        this._lean = true;
    }

    async redeem(token: string, userId: string) {
        return this._model.findOneAndUpdate(
            {token, redeemedAt: null},
            {$set: {redeemedAt: new Date(), redeemedBy: userId}},
            {new: true, runValidators: true},
        ).populate(this._populateFields).lean().exec() as Promise<IBenefitClaim | null>;
    }

    async statistics(): Promise<BenefitStatistics> {
        // Group first so lookups run per benefit, not per coupon. Only counters
        // reach the facets; tokens and operator data never leave the database.
        const [result] = await this._model.aggregate([
            {$group: {
                _id: '$benefit', generated: {$sum: 1},
                redeemed: {$sum: {$cond: [{$ifNull: ['$redeemedAt', false]}, 1, 0]}},
            }},
            {$lookup: {from: BenefitModel.collection.name, localField: '_id', foreignField: '_id', as: 'benefit'}},
            {$unwind: {path: '$benefit', preserveNullAndEmptyArrays: true}},
            {$lookup: {from: CompanyModel.collection.name, localField: 'benefit.company', foreignField: '_id', as: 'company'}},
            {$unwind: {path: '$company', preserveNullAndEmptyArrays: true}},
            {$facet: {
                totals: [{$group: {_id: null, claims: {$sum: '$generated'}, redeemed: {$sum: '$redeemed'}}}],
                byBenefit: [
                    {$project: {_id: 0, id: {$toString: '$_id'}, name: {$ifNull: ['$benefit.title', '']}, generated: 1, redeemed: 1}},
                    {$sort: {name: 1, id: 1}},
                ],
                byCompany: [
                    {$group: {_id: {$ifNull: ['$benefit.company', null]}, name: {$first: {$ifNull: ['$company.name', '']}},
                        generated: {$sum: '$generated'}, redeemed: {$sum: '$redeemed'}}},
                    {$project: {_id: 0, id: {$ifNull: [{$toString: '$_id'}, '']}, name: 1, generated: 1, redeemed: 1}},
                    {$sort: {name: 1, id: 1}},
                ],
            }},
        ]);
        const claims = result?.totals[0]?.claims ?? 0;
        const redeemed = result?.totals[0]?.redeemed ?? 0;
        return {claims, redeemed, pending: claims - redeemed, byBenefit: result?.byBenefit ?? [], byCompany: result?.byCompany ?? []};
    }
}
export default BenefitClaimMongoRepository;
export {BenefitClaimMongoRepository};
