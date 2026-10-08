import { ArchGenerator } from '@drax/arch';

import CompanySchema from './schemas/benefits/CompanySchema.js';
import CategorySchema from './schemas/benefits/CategorySchema.js';
import BenefitSchema from './schemas/benefits/BenefitSchema.js';
import BenefitClaimSchema from './schemas/benefits/BenefitClaimSchema.js';

const schemas = [
    CompanySchema,
    CategorySchema,
    BenefitSchema,
    BenefitClaimSchema,
];

const generator = new ArchGenerator(schemas);
generator.build()
