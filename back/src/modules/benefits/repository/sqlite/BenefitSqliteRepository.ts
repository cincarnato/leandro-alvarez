
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {IBenefitRepository} from '../../interfaces/IBenefitRepository'
import type {IBenefit, IBenefitBase} from "../../interfaces/IBenefit";
import {SqliteTableField} from "@drax/common-back";

class BenefitSqliteRepository extends AbstractSqliteRepository<IBenefit, IBenefitBase, IBenefitBase> implements IBenefitRepository {

    protected db: any;
    protected tableName: string = 'Benefit';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['active', 'featured'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        { field: 'company', table: 'company', identifier: '_id' },
{ field: 'category', table: 'category', identifier: '_id' }
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "title", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "company", type: "TEXT", unique: undefined, primary: false},
{name: "category", type: "TEXT", unique: undefined, primary: false},
{name: "image", type: "TEXT", unique: undefined, primary: false},
{name: "startDate", type: "TEXT", unique: undefined, primary: false},
{name: "endDate", type: "TEXT", unique: undefined, primary: false},
{name: "conditions", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false},
{name: "featured", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default BenefitSqliteRepository
export {BenefitSqliteRepository}

