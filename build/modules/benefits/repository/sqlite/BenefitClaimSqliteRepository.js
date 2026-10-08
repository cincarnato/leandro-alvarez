import { AbstractSqliteRepository } from "@drax/crud-back";
class BenefitClaimSqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'BenefitClaim';
        this.searchFields = [];
        this.booleanFields = [];
        this.jsonFields = [];
        this.identifier = '_id';
        this.populateFields = [
            { field: 'benefit', table: 'benefit', identifier: '_id' },
            { field: 'redeemedBy', table: 'redeemedBy', identifier: '_id' }
        ];
        this.verbose = false;
        this.tableFields = [
            { name: "benefit", type: "TEXT", unique: undefined, primary: false },
            { name: "token", type: "TEXT", unique: true, primary: false },
            { name: "redeemedAt", type: "TEXT", unique: undefined, primary: false },
            { name: "redeemedBy", type: "TEXT", unique: undefined, primary: false }
        ];
    }
}
export default BenefitClaimSqliteRepository;
export { BenefitClaimSqliteRepository };
