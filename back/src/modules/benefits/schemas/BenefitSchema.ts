import {z} from 'zod';
import {CompanySchema} from './CompanySchema.js';
import {CategorySchema} from './CategorySchema.js';

import {ObjectIdSchema} from './ObjectIdSchema.js';
export {ObjectIdSchema} from './ObjectIdSchema.js';
export const BenefitBaseSchema = z.object({
    title: z.string().min(1, 'validation.required'),
    description: z.string().optional(),
    company: ObjectIdSchema,
    category: ObjectIdSchema,
    image: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    conditions: z.string().min(1, 'validation.required'),
    active: z.boolean().optional(),
    featured: z.boolean().optional(),
});

export const BenefitDatesSchema = z.object({startDate: z.coerce.date(), endDate: z.coerce.date()})
    .refine(data => data.endDate >= data.startDate, {path: ['endDate'], message: 'validation.dateRange'});

export const BenefitSchema = BenefitBaseSchema.extend({
    _id: z.coerce.string(),
    company: CompanySchema.omit({users: true}).nullable(),
    category: CategorySchema.nullable(),
});
export default BenefitSchema;
