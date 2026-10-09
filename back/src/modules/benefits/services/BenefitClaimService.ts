import {randomBytes} from 'node:crypto';
import type {IBenefitClaimRepository} from '../interfaces/IBenefitClaimRepository.js';
import type {IBenefitClaimBase, IBenefitClaim} from '../interfaces/IBenefitClaim.js';
import {AbstractService} from '@drax/crud-back';
import {BadRequestError, ForbiddenError, MethodNotAllowedError, NotFoundError} from '@drax/common-back';
import {UserServiceFactory} from '@drax/identity-back';
import type {IRbac} from '@drax/identity-share';
import type {IDraxFieldFilter} from '@drax/crud-share';
import type {ZodObject, ZodRawShape} from 'zod';
import BenefitServiceFactory from '../factory/services/BenefitServiceFactory.js';
import CompanyServiceFactory from '../factory/services/CompanyServiceFactory.js';
import {CouponSchema, StatisticsSchema} from '../schemas/PublicBenefitSchema.js';

class BenefitClaimService extends AbstractService<IBenefitClaim, IBenefitClaimBase, IBenefitClaimBase> {
    constructor(private repository: IBenefitClaimRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(repository, baseSchema, fullSchema);
    }

    async create(_data: IBenefitClaimBase): Promise<IBenefitClaim> { throw new MethodNotAllowedError(); }
    async update(_id: string, _data: IBenefitClaimBase): Promise<IBenefitClaim> { throw new MethodNotAllowedError(); }
    async updatePartial(_id: string, _data: Partial<IBenefitClaimBase>): Promise<IBenefitClaim> { throw new MethodNotAllowedError(); }
    async delete(_id: string): Promise<boolean> { throw new MethodNotAllowedError(); }

    async issue(benefitId: string) {
        const benefit = await BenefitServiceFactory.instance.available(benefitId);
        const claim = await super.create({benefit: benefit._id, token: randomBytes(32).toString('hex'), redeemedAt: null});
        return this.coupon(claim);
    }

    coupon(claim: IBenefitClaim) {
        return CouponSchema.parse({...claim, redeemedAt: claim.redeemedAt ?? null});
    }

    async byToken(token: string) {
        const claim = await this.findOneBy('token', token);
        if (!claim) throw new NotFoundError();
        return claim;
    }

    async merchantCompanies(rbac: IRbac): Promise<string[] | null> {
        if (rbac.getRole?.name?.toUpperCase() !== 'MERCHANT') return null;
        const user = await UserServiceFactory().findById(rbac.userId);
        if (!user?.active) throw new ForbiddenError();
        const companies = await CompanyServiceFactory.instance.findByUser(rbac.userId);
        if (!companies.length) throw new ForbiddenError();
        return companies.map(company => company._id);
    }

    async scopeFilters(rbac: IRbac): Promise<IDraxFieldFilter[]> {
        const companies = await this.merchantCompanies(rbac);
        if (!companies) return [];
        const benefits = await BenefitServiceFactory.instance.find({filters: [{field: 'company', operator: 'in', value: companies}]});
        return [{field: 'benefit', operator: 'in', value: benefits.map(benefit => benefit._id)}];
    }

    async inspect(token: string, rbac: IRbac) {
        const claim = await this.byToken(token);
        const companies = await this.merchantCompanies(rbac);
        if (companies && !companies.includes(claim.benefit?.company?._id)) throw new ForbiddenError();
        return claim;
    }

    async redeem(token: string, rbac: IRbac) {
        const claim = await this.inspect(token, rbac);
        if (claim.redeemedAt) throw new BadRequestError('Coupon already redeemed');
        if (!claim.benefit) throw new NotFoundError('Benefit unavailable');
        await BenefitServiceFactory.instance.available(claim.benefit._id);
        const redeemed = await this.repository.redeem(token, rbac.userId);
        if (!redeemed) throw new BadRequestError('Coupon already redeemed');
        return this.coupon(await this.validateOutput(redeemed));
    }

    async statistics(rbac: IRbac) {
        if (rbac.getRole?.name?.toUpperCase() === 'MERCHANT') throw new ForbiddenError();
        return StatisticsSchema.parse(await this.repository.statistics());
    }
}
export default BenefitClaimService;
export {BenefitClaimService};
