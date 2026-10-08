
import {mongoose} from '@drax/common-back';
import {PaginateModel} from "mongoose";
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2'
import type {ICategory} from '../interfaces/ICategory'

const CategorySchema = new mongoose.Schema<ICategory>({
            name: {type: String,   required: true, index: false, unique: false },
            description: {type: String,   required: false, index: false, unique: false }
}, {timestamps: true});

CategorySchema.plugin(uniqueValidator, {message: 'validation.unique'});
CategorySchema.plugin(mongoosePaginate);

CategorySchema.virtual("id").get(function () {
    return this._id.toString();
});


CategorySchema.set('toJSON', {getters: true, virtuals: true});

CategorySchema.set('toObject', {getters: true, virtuals: true});

const MODEL_NAME = 'Category';
const COLLECTION_NAME = 'Category';
const CategoryModel = mongoose.model<ICategory, PaginateModel<ICategory>>(MODEL_NAME, CategorySchema,COLLECTION_NAME);

export {
    CategorySchema,
    CategoryModel
}

export default CategoryModel
