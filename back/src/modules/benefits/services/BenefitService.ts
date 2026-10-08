import type {IBenefitRepository} from '../interfaces/IBenefitRepository.js';
import type {IBenefitBase, IBenefit} from '../interfaces/IBenefit.js';
import {AbstractService} from '@drax/crud-back';
import {NotFoundError, ValidationError, ZodErrorToValidationError} from '@drax/common-back';
import type {ZodObject, ZodRawShape} from 'zod';
import type {IDraxFieldFilter} from '@drax/crud-share';
import {ZodError} from 'zod';
import {BenefitDatesSchema} from '../schemas/BenefitSchema.js';
import {PublicBenefitSchema} from '../schemas/PublicBenefitSchema.js';
import CompanyServiceFactory from '../factory/services/CompanyServiceFactory.js';
import CategoryServiceFactory from '../factory/services/CategoryServiceFactory.js';

class BenefitService extends AbstractService<IBenefit, IBenefitBase, IBenefitBase> {
    constructor(repository: IBenefitRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
        this.transformCreate = async data => {
            await this.validateRelations(data);
            this.validateDates(data);
            return {...data, active: data.active ?? true, featured: data.featured ?? false};
        };
    }

    private validateDates(data: Pick<IBenefitBase, 'startDate' | 'endDate'>) {
        try { BenefitDatesSchema.parse(data); }
        catch (error) {
            if (error instanceof ZodError) throw ZodErrorToValidationError(error, data);
            throw error;
        }
    }

    private async validateRelations(data: Partial<IBenefitBase>) {
        if (data.company !== undefined && !await CompanyServiceFactory.instance.findById(data.company)) {
            throw new ValidationError([{field: 'company', reason: 'validation.notFound'}]);
        }
        if (data.category !== undefined && !await CategoryServiceFactory.instance.findById(data.category)) {
            throw new ValidationError([{field: 'category', reason: 'validation.notFound'}]);
        }
    }

    // Validate the combined stored/input dates, not just the supplied PATCH fields.
    private async validateChange(id: string, data: Partial<IBenefitBase>) {
        const current = await this.findById(id);
        if (!current) throw new NotFoundError();
        await this.validateRelations(data);
        this.validateDates({...current, ...data});
    }

    async update(id: string, data: IBenefitBase) {
        data = await this.validateInputUpdate(data);
        await this.validateChange(id, data);
        return super.update(id, data);
    }

    async updatePartial(id: string, data: Partial<IBenefitBase>) {
        // Parse to cast dates and strip unknown fields, without adding defaults.
        data = await this.validateInputUpdate(data as IBenefitBase);
        await this.validateChange(id, data);
        return super.updatePartial(id, data);
    }

    async catalog(category?: string) {
        const companies = await CompanyServiceFactory.instance.find({filters: [{field: 'active', operator: 'eq', value: true}]});
        if (!companies.length) return [];
        const now = new Date();
        const filters: IDraxFieldFilter[] = [
            {field: 'active', operator: 'eq', value: true},
            {field: 'company', operator: 'in', value: companies.map(company => company._id)},
            {field: 'startDate', operator: 'lte', value: now},
            {field: 'endDate', operator: 'gte', value: now},
        ];
        if (category) filters.push({field: 'category', operator: 'eq', value: category});
        const benefits = await this.find({filters, orderBy: 'featured', order: 'desc'});
        return benefits.filter(benefit => benefit.company && benefit.category).map(benefit => PublicBenefitSchema.parse(benefit));
    }

    async available(id: string) {
        const benefit = await this.findById(id);
        const now = new Date();
        if (!benefit || !benefit.active || !benefit.company?.active || !benefit.category ||
            benefit.startDate > now || benefit.endDate < now) throw new NotFoundError('Benefit unavailable');
        return benefit;
    }
}
export default BenefitService;
export {BenefitService};
