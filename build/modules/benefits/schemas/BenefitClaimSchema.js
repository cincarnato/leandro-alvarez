import { z } from 'zod';
import { BenefitSchema, ObjectIdSchema } from './BenefitSchema.js';
export const BenefitClaimBaseSchema = z.object({
    benefit: ObjectIdSchema,
    token: z.string().regex(/^[a-f\d]{64}$/),
    redeemedAt: z.coerce.date().nullable().optional(),
    redeemedBy: ObjectIdSchema.nullable().optional(),
});
export const BenefitClaimSchema = BenefitClaimBaseSchema.extend({
    _id: z.coerce.string(),
    benefit: BenefitSchema.nullable(),
    redeemedBy: z.coerce.string().nullable().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
});
export default BenefitClaimSchema;
