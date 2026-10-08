
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {IBenefit} from '../interfaces/IBenefit'

const BenefitSchema = new mongoose.Schema<IBenefit>({
            title: {type: String,   required: true, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false },
            company: {type: mongoose.Schema.Types.ObjectId, ref: 'Company',  required: true, index: false, unique: false },
            category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category',  required: true, index: false, unique: false },
            image: {type: String,   required: false, index: false, unique: false },
            startDate: {type: Date,   required: true, index: false, unique: false },
            endDate: {type: Date,   required: true, index: false, unique: false },
            conditions: {type: String,   required: true, index: false, unique: false },
            active: {type: Boolean, default: true, required: false, index: true, unique: false },
            featured: {type: Boolean, default: false, required: false, index: false, unique: false }
}, {timestamps: true});

BenefitSchema.plugin(uniqueValidator, {message: 'validation.unique'});
BenefitSchema.plugin(mongoosePaginate);

BenefitSchema.virtual("id").get(function () {
    return this._id.toString();
});


BenefitSchema.set('toJSON', {getters: true, virtuals: true});

BenefitSchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Benefit';
const COLLECTION_NAME = 'Benefit';
const BenefitModel = mongoose.model<IBenefit, PaginateModel<IBenefit>>(MODEL_NAME, BenefitSchema,COLLECTION_NAME);

export {
    BenefitSchema,
    BenefitModel
}

export default BenefitModel
