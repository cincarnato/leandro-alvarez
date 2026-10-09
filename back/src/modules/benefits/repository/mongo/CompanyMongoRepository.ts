
import {AbstractMongoRepository} from "@drax/crud-back";
import {CompanyModel} from "../../models/CompanyModel.js";
import type {ICompanyRepository} from '../../interfaces/ICompanyRepository'
import type {ICompany, ICompanyBase} from "../../interfaces/ICompany";


class CompanyMongoRepository extends AbstractMongoRepository<ICompany, ICompanyBase, ICompanyBase> implements ICompanyRepository {

    async findByUser(userId: string): Promise<ICompany[]> {
        return this.find({filters: [{field: 'users', operator: 'eq', value: userId}]});
    }

    constructor() {
        super();
        this._model = CompanyModel;
        this._searchFields = [];
        this._populateFields = [{path: 'users', select: '_id name username'}];
        this._lean = true
    }

}

export default CompanyMongoRepository
export {CompanyMongoRepository}

