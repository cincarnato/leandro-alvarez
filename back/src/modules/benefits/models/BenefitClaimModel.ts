
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IBenefitClaim} from '../interfaces/IBenefitClaim'

const BenefitClaimSchema = new mongoose.Schema<IBenefitClaim>({
            benefit: {type: mongoose.Schema.Types.ObjectId, ref: 'Benefit',  required: true, index: false, unique: false },
            token: {type: String, required: true, unique: true },
            redeemedAt: {type: Date, default: null, required: false, index: true, unique: false },
            redeemedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: false, index: false, unique: false }
}, {timestamps: true});

BenefitClaimSchema.plugin(uniqueValidator, {message: 'validation.unique'});
BenefitClaimSchema.plugin(mongoosePaginate);

BenefitClaimSchema.virtual("id").get(function () {
    return this._id.toString();
});


BenefitClaimSchema.set('toJSON', {getters: true, virtuals: true});

BenefitClaimSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'BenefitClaim';
const COLLECTION_NAME = 'BenefitClaim';
const BenefitClaimModel = mongoose.model<IBenefitClaim, PaginateModel<IBenefitClaim>>(MODEL_NAME, BenefitClaimSchema,COLLECTION_NAME);

export {
    BenefitClaimSchema,
    BenefitClaimModel
}

export default BenefitClaimModel
