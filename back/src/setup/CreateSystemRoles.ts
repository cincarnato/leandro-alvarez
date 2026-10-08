import {CreateOrUpdateRole, PermissionService} from "@drax/identity-back";
import {managerRole, merchantRole} from './data/roles/benefits-roles.js';
import operatorRole from "./data/roles/operator-role.js";
//import supervisorRole from "./data/roles/supervisor-role.js";

async function CreateSystemRoles(){
    await CreateOrUpdateRole(operatorRole)
    await CreateOrUpdateRole({name: 'ADMIN', permissions: [...PermissionService.getPermissions()], childRoles: [], readonly: true})
    await CreateOrUpdateRole(managerRole)
    await CreateOrUpdateRole(merchantRole)
    //await CreateOrUpdateRole(supervisorRole)
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
