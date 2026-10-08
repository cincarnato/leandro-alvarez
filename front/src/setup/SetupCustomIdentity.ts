import { useIdentityCrudStore } from '@drax/identity-vue'
import CustomUserCrud from '../modules/base/cruds/CustomUserCrud'
import CustomRoleCrud from "../modules/base/cruds/CustomRoleCrud";

function setupCustomIdentity(){
  const identityCrudStore = useIdentityCrudStore()
  identityCrudStore.setUserCrud(CustomUserCrud.instance)
  identityCrudStore.setRoleCrud(new CustomRoleCrud())
}


export default setupCustomIdentity
