import { mongoose, ValidationError, ZodErrorToValidationError } from '@drax/common-back';
import { UserMongoSchema, UserServiceFactory, RoleServiceFactory } from '@drax/identity-back';
import { ZodError } from 'zod';
import { UserCompanySchema } from '../modules/benefits/schemas/UserCompanySchema.js';
import CompanyServiceFactory from '../modules/benefits/factory/services/CompanyServiceFactory.js';
let initialized = false;
// Drax exports the Mongo schema; its User service validates but preserves extra
// input fields. Extend that service once, retaining its password/auth behavior.
export default function InitializeBenefitIdentity() {
    if (initialized)
        return;
    UserMongoSchema.add({ company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null } });
    const service = UserServiceFactory();
    const create = service.create.bind(service);
    const update = service.update.bind(service);
    async function validate(data, id) {
        let company;
        try {
            company = UserCompanySchema.parse(data).company;
        }
        catch (error) {
            if (error instanceof ZodError)
                throw ZodErrorToValidationError(error, data);
            throw error;
        }
        if (company && !await CompanyServiceFactory.instance.findById(company)) {
            throw new ValidationError([{ field: 'company', reason: 'validation.notFound' }]);
        }
        const role = await RoleServiceFactory().findById(data.role);
        if (company === undefined && id) {
            const current = await service.findById(id);
            company = current?.company?.toString();
        }
        if (role?.name.toUpperCase() === 'MERCHANT' && !company) {
            throw new ValidationError([{ field: 'company', reason: 'validation.required' }]);
        }
    }
    service.create = async (data) => { await validate(data); return create(data); };
    service.update = async (id, data) => { await validate(data, id); return update(id, data); };
    initialized = true;
}
