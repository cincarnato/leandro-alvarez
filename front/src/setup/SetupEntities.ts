import {RoleCrud, TenantCrud} from "@drax/identity-vue"
import { useEntityStore } from '@drax/crud-vue'
import { FileEntityCrud } from '@drax/media-vue'
import CompanyCrud from '../modules/benefits/cruds/CompanyCrud'
import CategoryCrud from '../modules/benefits/cruds/CategoryCrud'
import BenefitCrud from '../modules/benefits/cruds/BenefitCrud'
import CustomUserCrud from '../modules/base/cruds/CustomUserCrud'

function setupEntities(){
  const entityStore = useEntityStore()
  entityStore.addEntity(CustomUserCrud.instance)
  entityStore.addEntity(RoleCrud.instance)
  entityStore.addEntity(TenantCrud.instance)
  entityStore.addEntity(FileEntityCrud.instance)
  entityStore.addEntity(CompanyCrud.instance)
    entityStore.addEntity(CategoryCrud.instance)
    entityStore.addEntity(BenefitCrud.instance)

}

export default setupEntities
