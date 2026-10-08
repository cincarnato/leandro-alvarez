
import {AbstractMongoRepository} from "@drax/crud-back";
import {BenefitModel} from "../../models/BenefitModel.js";
import type {IBenefitRepository} from '../../interfaces/IBenefitRepository'
import type {IBenefit, IBenefitBase} from "../../interfaces/IBenefit";


class BenefitMongoRepository extends AbstractMongoRepository<IBenefit, IBenefitBase, IBenefitBase> implements IBenefitRepository {

    constructor() {
        super();
        this._model = BenefitModel;
        this._searchFields = [];
        this._populateFields = ['company', 'category'];
        this._lean = true
    }

}

export default BenefitMongoRepository
export {BenefitMongoRepository}

