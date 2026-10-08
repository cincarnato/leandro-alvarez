import { AbstractService } from "@drax/crud-back";
class CompanyService extends AbstractService {
    constructor(CompanyRepository, baseSchema, fullSchema) {
        super(CompanyRepository, baseSchema, fullSchema);
        this._validateOutput = true;
        this.transformCreate = async (data) => ({ ...data, active: data.active ?? true });
    }
}
export default CompanyService;
export { CompanyService };
