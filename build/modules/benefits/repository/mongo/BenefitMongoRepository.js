import { AbstractMongoRepository } from "@drax/crud-back";
import { BenefitModel } from "../../models/BenefitModel.js";
class BenefitMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = BenefitModel;
        this._searchFields = [];
        this._populateFields = ['company', 'category'];
        this._lean = true;
    }
}
export default BenefitMongoRepository;
export { BenefitMongoRepository };
