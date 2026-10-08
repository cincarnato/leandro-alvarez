import { AbstractSqliteRepository } from "@drax/crud-back";
class BenefitSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Benefit';
        this.searchFields = [];
        this.booleanFields = ['active', 'featured'];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'company', table: 'company', identifier: '_id' },
            { field: 'category', table: 'category', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "title", type: "TEXT", unique: undefined, primary: false },
            { name: "description", type: "TEXT", unique: undefined, primary: false },
            { name: "company", type: "TEXT", unique: undefined, primary: false },
            { name: "category", type: "TEXT", unique: undefined, primary: false },
            { name: "image", type: "TEXT", unique: undefined, primary: false },
            { name: "startDate", type: "TEXT", unique: undefined, primary: false },
            { name: "endDate", type: "TEXT", unique: undefined, primary: false },
            { name: "conditions", type: "TEXT", unique: undefined, primary: false },
            { name: "active", type: "TEXT", unique: undefined, primary: false },
            { name: "featured", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default BenefitSqliteRepository;
export { BenefitSqliteRepository };
