import { AbstractMongoRepository } from "@drax/crud-back";
import { CategoryModel } from "../../models/CategoryModel.js";
class CategoryMongoRepository extends AbstractMongoRepository {
    constructor() {
        super();
        this._model = CategoryModel;
        this._searchFields = [];
        this._populateFields = [];
        this._lean = true;
    }
}
export default CategoryMongoRepository;
export { CategoryMongoRepository };
