
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICompanyRepository} from '../../interfaces/ICompanyRepository'
import type {ICompany, ICompanyBase} from "../../interfaces/ICompany";
import {SqliteTableField} from "@drax/common-back";

class CompanySqliteRepository extends AbstractSqliteRepository<ICompany, ICompanyBase, ICompanyBase> implements ICompanyRepository {

    protected db: any;
    protected tableName: string = 'Company';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = ['active'];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false},
{name: "logo", type: "TEXT", unique: undefined, primary: false},
{name: "cuit", type: "TEXT", unique: undefined, primary: false},
{name: "contactName", type: "TEXT", unique: undefined, primary: false},
{name: "contactEmail", type: "TEXT", unique: undefined, primary: false},
{name: "contactPhone", type: "TEXT", unique: undefined, primary: false},
{name: "active", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CompanySqliteRepository
export {CompanySqliteRepository}

