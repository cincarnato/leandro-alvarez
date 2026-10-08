import { AbstractSqliteRepository } from "@drax/crud-back";
class CategorySqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Category';
        this.searchFields = [];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "name", type: "TEXT", unique: undefined, primary: false },
            { name: "description", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CategorySqliteRepository;
export { CategorySqliteRepository };
