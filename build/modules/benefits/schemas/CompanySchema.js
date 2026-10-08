import { z } from 'zod';
const CompanyBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional(),
    logo: z.string().optional(),
    cuit: z.string().optional(),
    contactName: z.string().optional(),
    contactEmail: z.string().optional(),
    contactPhone: z.string().optional(),
    active: z.boolean().optional()
});
const CompanySchema = CompanyBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default CompanySchema;
export { CompanySchema, CompanyBaseSchema };
