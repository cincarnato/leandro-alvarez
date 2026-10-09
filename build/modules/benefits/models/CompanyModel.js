import { mongoose } from '@drax/common-back';
import uniqueValidator from 'mongoose-unique-validator';
import mongoosePaginate from 'mongoose-paginate-v2';
const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, index: false, unique: false },
    users: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [], index: true },
    description: { type: String, required: false, index: false, unique: false },
    logo: { type: String, required: false, index: false, unique: false },
    cuit: { type: String, required: false, index: false, unique: false },
    contactName: { type: String, required: false, index: false, unique: false },
    contactEmail: { type: String, required: false, index: false, unique: false },
    contactPhone: { type: String, required: false, index: false, unique: false },
    active: { type: Boolean, default: true, required: false, index: false, unique: false }
}, { timestamps: true });
CompanySchema.plugin(uniqueValidator, { message: 'validation.unique' });
CompanySchema.plugin(mongoosePaginate);
CompanySchema.virtual("id").get(function () {
    return this._id.toString();
});
CompanySchema.set('toJSON', { getters: true, virtuals: true });
CompanySchema.set('toObject', { getters: true, virtuals: true });
const MODEL_NAME = 'Company';
const COLLECTION_NAME = 'Company';
const CompanyModel = mongoose.model(MODEL_NAME, CompanySchema, COLLECTION_NAME);
export { CompanySchema, CompanyModel };
export default CompanyModel;
