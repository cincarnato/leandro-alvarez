import { z } from 'zod';
const CategoryBaseSchema = z.object({
    name: z.string().min(1, 'validation.required'),
    description: z.string().optional()
});
const CategorySchema = CategoryBaseSchema
    .extend({
    _id: z.coerce.string(),
});
export default CategorySchema;
export { CategorySchema, CategoryBaseSchema };
