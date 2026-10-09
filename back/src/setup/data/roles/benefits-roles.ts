import {MediaPermissions, FilePermissions} from '@drax/media-back';
import CompanyPermissions from '../../../modules/benefits/permissions/CompanyPermissions.js';
import CategoryPermissions from '../../../modules/benefits/permissions/CategoryPermissions.js';
import BenefitPermissions from '../../../modules/benefits/permissions/BenefitPermissions.js';
import BenefitClaimPermissions from '../../../modules/benefits/permissions/BenefitClaimPermissions.js';
import BenefitsPermissions from '../../../modules/benefits/permissions/BenefitsPermissions.js';

export const merchantRole = {
    name: 'Comerciante', permissions: Object.values(BenefitClaimPermissions), childRoles: [], readonly: true,
};
export const managerRole = {
    name: 'Gestor',
    permissions: [
        ...Object.values(CompanyPermissions), ...Object.values(CategoryPermissions),
        ...Object.values(BenefitPermissions), ...Object.values(BenefitClaimPermissions),
        ...Object.values(BenefitsPermissions),
        MediaPermissions.UploadFile, FilePermissions.View,
    ],
    childRoles: [], readonly: true,
};
