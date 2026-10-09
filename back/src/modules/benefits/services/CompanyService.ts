import type {ICompanyRepository} from '../interfaces/ICompanyRepository.js';
import type {ICompanyBase, ICompany} from '../interfaces/ICompany.js';
import {AbstractService} from '@drax/crud-back';
import {ValidationError} from '@drax/common-back';
import {UserServiceFactory} from '@drax/identity-back';
import type {ZodObject, ZodRawShape} from 'zod';
import {CompanyUserSchema} from '../schemas/CompanySchema.js';

class CompanyService extends AbstractService<ICompany, ICompanyBase, ICompanyBase> {
    constructor(private repository: ICompanyRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
        this.transformCreate = async data => {
            await this.validateUsers(data.users);
            return {...data, active: data.active ?? true, users: data.users ?? []};
        };
        this.transformUpdate = this.transformUpdatePartial = async data => {
            await this.validateUsers(data.users);
            return data;
        };
    }

    private async validateUsers(users?: string[]) {
        for (const id of new Set(users ?? [])) {
            if (!await UserServiceFactory().findById(id)) {
                throw new ValidationError([{field: 'users', reason: 'validation.notFound'}]);
            }
        }
    }

    async validateInputUpdatePartial(data: ICompanyBase) {
        // Use the parsed input to strip unknown fields without injecting defaults.
        return this.validateInputUpdate(data);
    }

    async findByUser(userId: string) {
        const companies = await this.repository.findByUser(userId);
                return Promise.all(companies.map(company => this.validateOutput(company)));
    }

    async userOptions(search = '') {
        const users = await UserServiceFactory().search(search, 50);
        return users.map(user => CompanyUserSchema.parse(user));
    }
}

export default CompanyService;
export {CompanyService};
