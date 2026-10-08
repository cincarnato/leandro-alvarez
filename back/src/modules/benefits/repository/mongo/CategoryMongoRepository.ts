
import {AbstractMongoRepository} from "@drax/crud-back";
import {CategoryModel} from "../../models/CategoryModel.js";
import type {ICategoryRepository} from '../../interfaces/ICategoryRepository'
import type {ICategory, ICategoryBase} from "../../interfaces/ICategory";


class CategoryMongoRepository extends AbstractMongoRepository<ICategory, ICategoryBase, ICategoryBase> implements ICategoryRepository {

    constructor() {
        super();
        this._model = CategoryModel;
        this._searchFields = [];
        this._populateFields = [];
        this._lean = true
    }

}

export default CategoryMongoRepository
export {CategoryMongoRepository}

