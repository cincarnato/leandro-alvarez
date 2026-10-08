import {z} from 'zod';
import {ObjectIdSchema} from './BenefitSchema.js';

export const IdParamsSchema = z.object({id: ObjectIdSchema});
export const TokenParamsSchema = z.object({token: z.string().regex(/^[a-f\d]{64}$/, 'validation.invalidToken')});
export const CatalogQuerySchema = z.object({category: ObjectIdSchema.optional()});
export const ClaimsPaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
});
