import { benefitsRequest } from './BenefitsApi'
import type { CouponPage } from '../interfaces/PublicBenefit'

// Claims have no generic CRUD, import/export or token-update API.
class BenefitClaimProvider {
  static singleton: BenefitClaimProvider
  static get instance() { return this.singleton ??= new BenefitClaimProvider() }

  paginate({ page = 1, limit = 10, status = '' } = {}): Promise<CouponPage> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), orderBy: 'createdAt', order: 'desc' })
    if (status === 'pending') params.set('filters', 'redeemedAt;empty;')

    return benefitsRequest<CouponPage>(`/api/benefit-claims?${params}`)
  }
}
export default BenefitClaimProvider
