import {z} from 'zod';
import {BenefitSchema} from './BenefitSchema.js';
import {CompanySchema} from './CompanySchema.js';
import {CategorySchema} from './CategorySchema.js';

export const PublicCategorySchema = CategorySchema.pick({_id: true, name: true});
export const PublicCompanySchema = CompanySchema.pick({_id: true, name: true, logo: true, active: true});
export const PublicBenefitSchema = BenefitSchema.pick({
    _id: true, title: true, description: true, image: true, startDate: true,
    endDate: true, conditions: true, active: true,
}).extend({
    featured: z.boolean().default(false), // Read projection only; never used for PATCH inputs.
    company: PublicCompanySchema.nullable(), category: PublicCategorySchema.nullable(),
});
export const CouponSchema = z.object({
    token: z.string(),
    createdAt: z.coerce.date(),
    redeemedAt: z.coerce.date().nullable(),
    benefit: PublicBenefitSchema.nullable(),
});
export const StatisticsBreakdownSchema = z.object({
    id: z.string(), name: z.string(), generated: z.number().int().nonnegative(), redeemed: z.number().int().nonnegative(),
});
export const StatisticsSchema = z.object({
    claims: z.number().int().nonnegative(), redeemed: z.number().int().nonnegative(), pending: z.number().int().nonnegative(),
    byBenefit: z.array(StatisticsBreakdownSchema),
    byCompany: z.array(StatisticsBreakdownSchema),
});
export type BenefitStatistics = z.infer<typeof StatisticsSchema>;
