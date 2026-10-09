
import {EntityCrud} from "@drax/crud-vue";
import type{
  IDraxCrudProvider,
  IEntityCrud,
  IEntityCrudField,
  IEntityCrudFilter,
  IEntityCrudHeader, 
  IEntityCrudPermissions,
  IEntityCrudRefs,
  IEntityCrudRules,
    IEntityCrudOperation
} from "@drax/crud-share";
import CompanyProvider from "../providers/CompanyProvider";

import {UserCrud} from "@drax/identity-vue";


class CompanyCrud extends EntityCrud implements IEntityCrud {

  static singleton: CompanyCrud


  constructor() {
    super();
    this.name = 'Company'

  }
  
  static get instance(): CompanyCrud {
    if(!CompanyCrud.singleton){
      CompanyCrud.singleton = new CompanyCrud()
    }
    return CompanyCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'company:manage', 
      view: 'company:view', 
      create: 'company:create', 
      update: 'company:update', 
      delete: 'company:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      { title: 'name', key: 'name', align: 'start' },
      { title: 'logo', key: 'logo', sortable: false },
      { title: 'cuit', key: 'cuit' },
      { title: 'contactName', key: 'contactName' },
      { title: 'contactEmail', key: 'contactEmail' },
      { title: 'contactPhone', key: 'contactPhone' },
      { title: 'users', key: 'users', sortable: false },
      { title: 'active', key: 'active' },
    ]
  }
  
  get selectedHeaders(): string[] {
    return this.headers.map(header => header.key)
  }
  
  get actionHeaders():IEntityCrudHeader[]{
    return [
      {
        title: 'action.actions',
        key: 'actions',
        sortable: false,
        align: 'center',
        minWidth: '190px',
        fixed: 'end'
      },
    ]
  }

  get provider(): IDraxCrudProvider<any, any, any>{
    return CompanyProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      User: UserCrud.instance
    }
  }

  get rules():IEntityCrudRules{
    return {
      name: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'name',type:'string',label:'name',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'logo',type:'file',label:'logo',default:'',preview:true},
{name:'cuit',type:'string',label:'cuit',default:''},
{name:'contactName',type:'string',label:'contactName',default:''},
{name:'contactEmail',type:'string',label:'contactEmail',default:''},
{name:'contactPhone',type:'string',label:'contactPhone',default:''},
{name:'users',type:'array.ref',label:'users',default:[],ref:'User',refDisplay:'name'},
{name:'active',type:'boolean',label:'active',default:true}
    ]
  }
  
  get filters():IEntityCrudFilter[]{
    return [
      //{name: '_id', type: 'string', label: 'ID', default: '', operator: 'eq' },
    ]
  }
  
  get isViewable(){
    return true
  }

  get isEditable(){
    return true
  }

  get isCreatable(){
    return true
  }

  get isDeletable(){
    return true
  }

  get isExportable(){
    return true
  }

  get exportFormats(){
    return ['CSV', 'JSON']
  }

  get exportHeaders(){
    return ['_id', 'name', 'cuit', 'contactName', 'contactEmail', 'contactPhone', 'active']
  }

  get exportPretty(){
    return true
  }

  get isImportable(){
    return false
  }
  
  get isColumnSelectable() {
    return true
  }

  get isGroupable() {
    return true
  }

  get importFormats(){
    return ['CSV', 'JSON']
  }

  get dialogFullscreen(){
    return true
  }
  
  get tabs() {
    return [
     
    ]
  }
  
  get menus() {
    return [
     
    ]
  }
  
  get searchEnable() {
    return true
  }

   get filtersEnable(){
    return true
  }

  get dynamicFiltersEnable(){
    return true
  }

  get isAiAssistable(){
    return false
  }

  get navigationOperations(): IEntityCrudOperation[] {
    return ['view'] // edit, delete
  }
  
  get isSavedQueriesEnabled(){
    return true
  }

}

export default CompanyCrud

