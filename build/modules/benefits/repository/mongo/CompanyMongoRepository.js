import { AbstractMongoRepository } from "@drax/crud-back";
import { CompanyModel } from "../../models/CompanyModel.js";
class CompanyMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CompanyModel;
        this._searchFields = [];
        this._populateFields = [];
        this._lean = true;
    }
}
export default CompanyMongoRepository;
export { CompanyMongoRepository };
