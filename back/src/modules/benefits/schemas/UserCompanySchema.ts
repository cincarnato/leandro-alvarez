import {z} from 'zod';
import {ObjectIdSchema} from './BenefitSchema.js';

export const UserCompanySchema = z.object({company: ObjectIdSchema.nullable().optional()});
