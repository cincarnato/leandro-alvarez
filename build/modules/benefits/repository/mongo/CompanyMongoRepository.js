import { AbstractMongoRepository } from "@drax/crud-back";
import { CompanyModel } from "../../models/CompanyModel.js";
class CompanyMongoRepository extends AbstractMongoRepository {
    async findByUser(userId) {
        return this.find({ filters: [{ field: 'users', operator: 'eq', value: userId }] });
    }
    constructor() {
        super();
        this._model = CompanyModel;
        this._searchFields = [];
        this._populateFields = [{ path: 'users', select: '_id name username' }];
        this._lean = true;
    }
}
export default CompanyMongoRepository;
export { CompanyMongoRepository };
