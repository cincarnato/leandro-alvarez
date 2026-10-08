import { AbstractService } from "@drax/crud-back";
class CategoryService extends AbstractService {
    constructor(CategoryRepository, baseSchema, fullSchema) {
        super(CategoryRepository, baseSchema, fullSchema);
        this._validateOutput = true;
    }
}
export default CategoryService;
export { CategoryService };
