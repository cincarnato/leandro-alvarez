
// import {UserSystemFactory} from "@drax/identity-front";
import {UserCrud} from "@drax/identity-vue";
import CompanyCrud from '../../benefits/cruds/CompanyCrud';


import type {
  IEntityCrud, IEntityCrudHeader, IEntityCrudField, IEntityCrudRefs,
  // IEntityCrudField, IEntityCrudFilter, IEntityCrudHeader, IEntityCrudRefs
} from "@drax/crud-share";


class CustomUserCrud extends UserCrud implements IEntityCrud {

  static singleton: UserCrud

  constructor() {
    super();
    this.name = 'User'
  }

  static get instance(): UserCrud {
    if(!CustomUserCrud.singleton){
      CustomUserCrud.singleton = new CustomUserCrud()
    }
    return CustomUserCrud.singleton
  }

  get fields(): IEntityCrudField[] {
      return [...super.fields, { name: 'company', type: 'ref', ref: 'Company', refDisplay: 'name', label: 'company', default: null, permission: 'user:manage' }]
    }

    get refs(): IEntityCrudRefs {
      return { ...super.refs, Company: CompanyCrud.instance }
    }

    get headers():IEntityCrudHeader[] {
    return [
      //{title: 'id',key:'_id', align: 'start'},
      { title: 'name', key: 'name', align: 'start' },
      { title: 'username', key: 'username', align: 'start' },
      // { title: 'email', key: 'email', align: 'start' },
      { title: 'role', key: 'role', align: 'start' },
      ...(this.isTenantEnabled ? [{ title: 'tenant', key: 'tenant.name', align: 'start' as const }] : []),
      { title: 'company', key: 'company', align: 'start' },
            { title: 'active', key: 'active', align: 'start' },
    ]
  }

  get applyFilterClass(){
    return 'bg-red'
  }

}

export default CustomUserCrud

