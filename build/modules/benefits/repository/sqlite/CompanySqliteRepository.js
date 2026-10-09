import { AbstractSqliteRepository } from "@drax/crud-back";
class CompanySqliteRepository extends AbstractSqliteRepository {
    constructor() {
        super(...arguments);
        this.tableName = 'Company';
        this.searchFields = [];
        this.booleanFields = ['active'];
        this.jsonFields = ['users'];
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
            { name: "active", type: "TEXT", unique: undefined, primary: false },
            { name: "users", type: "TEXT", unique: undefined, primary: false }
        ];
    }
    async prepareItem(item) {
        const ids = item.users ?? [];
        item.users = ids.map((id) => this.db.prepare('SELECT _id, name, username FROM users WHERE _id = ?').get(id)).filter(Boolean);
        return item;
    }
    async findByUser(userId) {
        const items = this.db.prepare(`SELECT * FROM Company WHERE EXISTS (
            SELECT 1 FROM json_each(COALESCE(Company.users, '[]')) WHERE json_each.value = ?
        )`).all(userId);
        for (const item of items)
            await this.decorate(item);
        return items;
    }
}
export default CompanySqliteRepository;
export { CompanySqliteRepository };
