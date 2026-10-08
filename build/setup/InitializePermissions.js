import { LoadPermissions } from "@drax/identity-back";
import { UserPermissions, RolePermissions, TenantPermissions, UserApiKeyPermissions, UserLoginFailPermissions, UserSessionPermissions } from "@drax/identity-back";
import { MediaPermissions, FilePermissions } from "@drax/media-back";
import { SettingPermissions } from "@drax/settings-back";
import { DashboardPermissions } from "@drax/dashboard-back";
import { AuditPermissions } from "@drax/audit-back";
import { AILogPermissions, AIPermissions } from "@drax/ai-back";
import { CrudSavedQueryPermissions } from "@drax/crud-back";
import { RecoveryPermissions } from "@drax/recovery-back";
import { BasePermissions } from "../modules/base/permissions/BasePermissions.js";
import { NotificationPermissions } from "../modules/base/permissions/NotificationPermissions.js";
import CompanyPermissions from '../modules/benefits/permissions/CompanyPermissions.js';
import CategoryPermissions from '../modules/benefits/permissions/CategoryPermissions.js';
import BenefitPermissions from '../modules/benefits/permissions/BenefitPermissions.js';
import BenefitClaimPermissions from '../modules/benefits/permissions/BenefitClaimPermissions.js';
import BenefitsPermissions from '../modules/benefits/permissions/BenefitsPermissions.js';
function InitializePermissions() {
    //Merge All Permissions
    const permissions = [
        ...Object.values(UserPermissions),
        ...Object.values(RolePermissions),
        ...Object.values(TenantPermissions),
        ...Object.values(UserApiKeyPermissions),
        ...Object.values(UserLoginFailPermissions),
        ...Object.values(UserSessionPermissions),
        ...Object.values(MediaPermissions),
        ...Object.values(FilePermissions),
        ...Object.values(SettingPermissions),
        ...Object.values(DashboardPermissions),
        ...Object.values(AuditPermissions),
        ...Object.values(AILogPermissions),
        ...Object.values(AIPermissions),
        ...Object.values(CrudSavedQueryPermissions),
        ...Object.values(RecoveryPermissions),
        //Local modules permissions
        ...Object.values(BasePermissions),
        ...Object.values(NotificationPermissions),
        ...Object.values(CompanyPermissions),
        ...Object.values(CategoryPermissions),
        ...Object.values(BenefitPermissions),
        ...Object.values(BenefitClaimPermissions),
        ...Object.values(BenefitsPermissions),
    ];
    //Load All Permissions
    LoadPermissions(permissions);
}
export default InitializePermissions;
export { InitializePermissions };
