import {CreateOrUpdateRole} from "@drax/identity-back";
import {managerRole, merchantRole} from './data/roles/benefits-roles.js';

async function CreateSystemRoles(){
    await CreateOrUpdateRole(managerRole)
    await CreateOrUpdateRole(merchantRole)
}

export default CreateSystemRoles

export {
    CreateSystemRoles
}
