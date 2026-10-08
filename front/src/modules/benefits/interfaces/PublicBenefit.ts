export interface PublicCategory { _id: string; name: string }
export interface PublicBenefit {
  _id: string
  title: string
  description?: string
  image?: string
  startDate: string
  endDate: string
  conditions: string
  active?: boolean
  featured: boolean
  company: { _id: string; name: string; logo?: string; active?: boolean } | null
  category: PublicCategory | null
}
export interface Coupon {
  token: string
  createdAt: string
  redeemedAt: string | null
  benefit: PublicBenefit | null
}
export interface CouponPage { page: number; limit: number; total: number; items: Coupon[] }
export interface StatisticsBreakdown {
  id: string
  name: string
  generated: number
  redeemed: number
}
export interface BenefitStatistics {
  claims: number
  redeemed: number
  pending: number
  byBenefit: StatisticsBreakdown[]
  byCompany: StatisticsBreakdown[]
}
