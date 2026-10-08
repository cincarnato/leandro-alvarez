import { randomBytes } from 'node:crypto';
import { AbstractService } from '@drax/crud-back';
import { BadRequestError, ForbiddenError, MethodNotAllowedError, NotFoundError } from '@drax/common-back';
import { UserServiceFactory } from '@drax/identity-back';
import BenefitServiceFactory from '../factory/services/BenefitServiceFactory.js';
import { CouponSchema, StatisticsSchema } from '../schemas/PublicBenefitSchema.js';
class BenefitClaimService extends AbstractService {
    constructor(repository, baseSchema, fullSchema) {
        super(repository, baseSchema, fullSchema);
        this.repository = repository;
    }
    async create(_data) { throw new MethodNotAllowedError(); }
    async update(_id, _data) { throw new MethodNotAllowedError(); }
    async updatePartial(_id, _data) { throw new MethodNotAllowedError(); }
    async delete(_id) { throw new MethodNotAllowedError(); }
    async issue(benefitId) {
        const benefit = await BenefitServiceFactory.instance.available(benefitId);
        const claim = await super.create({ benefit: benefit._id, token: randomBytes(32).toString('hex'), redeemedAt: null });
        return this.coupon(claim);
    }
    coupon(claim) {
        return CouponSchema.parse({ ...claim, redeemedAt: claim.redeemedAt ?? null });
    }
    async byToken(token) {
        const claim = await this.findOneBy('token', token);
        if (!claim)
            throw new NotFoundError();
        return claim;
    }
    async merchantCompany(rbac) {
        if (rbac.getRole?.name?.toUpperCase() !== 'MERCHANT')
            return null;
        const user = await UserServiceFactory().findById(rbac.userId);
        if (!user?.active || !user.company)
            throw new ForbiddenError();
        return user.company.toString();
    }
    async scopeFilters(rbac) {
        const company = await this.merchantCompany(rbac);
        if (!company)
            return [];
        const benefits = await BenefitServiceFactory.instance.find({ filters: [{ field: 'company', operator: 'eq', value: company }] });
        return [{ field: 'benefit', operator: 'in', value: benefits.map(benefit => benefit._id) }];
    }
    async inspect(token, rbac) {
        const claim = await this.byToken(token);
        const company = await this.merchantCompany(rbac);
        if (company && claim.benefit?.company?._id !== company)
            throw new ForbiddenError();
        return claim;
    }
    async redeem(token, rbac) {
        const claim = await this.inspect(token, rbac);
        if (claim.redeemedAt)
            throw new BadRequestError('Coupon already redeemed');
        if (!claim.benefit)
            throw new NotFoundError('Benefit unavailable');
        await BenefitServiceFactory.instance.available(claim.benefit._id);
        const redeemed = await this.repository.redeem(token, rbac.userId);
        if (!redeemed)
            throw new BadRequestError('Coupon already redeemed');
        return this.coupon(await this.validateOutput(redeemed));
    }
    async statistics(rbac) {
        if (rbac.getRole?.name?.toUpperCase() === 'MERCHANT')
            throw new ForbiddenError();
        return StatisticsSchema.parse(await this.repository.statistics());
    }
}
export default BenefitClaimService;
export { BenefitClaimService };
