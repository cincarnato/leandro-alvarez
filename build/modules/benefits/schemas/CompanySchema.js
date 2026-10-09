import { z } from 'zod';
import { ObjectIdSchema } from './ObjectIdSchema.js';
import { COMMON, CommonConfig, DraxConfig } from '@drax/common-back';
export const CompanyUserIdSchema = z.string().refine(value => {
    const schema = DraxConfig.getOrLoad(CommonConfig.DbEngine) === COMMON.DB_ENGINES.SQLITE ? z.uuid() : ObjectIdSchema;
    return schema.safeParse(value).success;
}, 'validation.invalidId');
export const CompanyUserSchema = z.object({
    _id: z.coerce.string(),
    name: z.string(),
    username: z.string(),
});
export const CompanyUserOptionsQuerySchema = z.object({ search: z.string().max(100).optional() });
const CompanyBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional(),
    logo: z.string().optional(),
    cuit: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    active: z.boolean().optional(),
    users: z.array(CompanyUserIdSchema).optional(),
});
const CompanySchema = CompanyBaseSchema.extend({
    _id: z.coerce.string(),
    users: z.array(CompanyUserSchema).default([]),
});
export default CompanySchema;
export { CompanySchema, CompanyBaseSchema };
