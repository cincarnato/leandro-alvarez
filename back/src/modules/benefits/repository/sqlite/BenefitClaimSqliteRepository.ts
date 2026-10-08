
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IBenefitClaimRepository} from '../../interfaces/IBenefitClaimRepository'
import type {IBenefitClaim, IBenefitClaimBase} from "../../interfaces/IBenefitClaim";
import {SqliteTableField} from "@drax/common-back";

class BenefitClaimSqliteRepository extends AbstractSqliteRepository<IBenefitClaim, IBenefitClaimBase, IBenefitClaimBase> implements IBenefitClaimRepository {

    protected db: any;
    protected tableName: string = 'BenefitClaim';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'benefit', table: 'benefit', identifier: '_id' },
{ field: 'redeemedBy', table: 'redeemedBy', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "benefit", type: "TEXT", unique: undefined, primary: false},
{name: "token", type: "TEXT", unique: true, primary: false},
{name: "redeemedAt", type: "TEXT", unique: undefined, primary: false},
{name: "redeemedBy", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default BenefitClaimSqliteRepository
export {BenefitClaimSqliteRepository}

