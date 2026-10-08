
import {AbstractSqliteRepository} from "@drax/crud-back";
import type {ICategoryRepository} from '../../interfaces/ICategoryRepository'
import type {ICategory, ICategoryBase} from "../../interfaces/ICategory";
import {SqliteTableField} from "@drax/common-back";

class CategorySqliteRepository extends AbstractSqliteRepository<ICategory, ICategoryBase, ICategoryBase> implements ICategoryRepository {

    protected db: any;
    protected tableName: string = 'Category';
    protected dataBaseFile: string;
    protected searchFields: string[] = [];
    protected booleanFields: string[] = [];
    protected jsonFields: string[] = [];
    protected identifier: string = '_id';
    protected populateFields = [
        
    ]
    protected verbose: boolean = false;
    protected tableFields: SqliteTableField[] = [
        {name: "name", type: "TEXT", unique: undefined, primary: false},
{name: "description", type: "TEXT", unique: undefined, primary: false}
    ]
  
}

export default CategorySqliteRepository
export {CategorySqliteRepository}

