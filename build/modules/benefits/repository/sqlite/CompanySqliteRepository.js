import { AbstractSqliteRepository } from "@drax/crud-back";
class CompanySqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Company';
        this.searchFields = [];
        this.booleanFields = ['active'];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [];
        this.verbose = false;
        this.tableFields = [
            { name: "name", type: "TEXT", unique: undefined, primary: false },
            { name: "description", type: "TEXT", unique: undefined, primary: false },
            { name: "logo", type: "TEXT", unique: undefined, primary: false },
            { name: "cuit", type: "TEXT", unique: undefined, primary: false },
            { name: "contactName", type: "TEXT", unique: undefined, primary: false },
            { name: "contactEmail", type: "TEXT", unique: undefined, primary: false },
            { name: "contactPhone", type: "TEXT", unique: undefined, primary: false },
            { name: "active", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default CompanySqliteRepository;
export { CompanySqliteRepository };
