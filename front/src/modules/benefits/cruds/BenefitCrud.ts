
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
import BenefitProvider from "../providers/BenefitProvider";

//Import EntityCrud Refs
import CompanyCrud from "./CompanyCrud";
import CategoryCrud from "./CategoryCrud";

class BenefitCrud extends EntityCrud implements IEntityCrud {

  static singleton: BenefitCrud


  constructor() {
    super();
    this.name = 'Benefit'

  }
  
  static get instance(): BenefitCrud {
    if(!BenefitCrud.singleton){
      BenefitCrud.singleton = new BenefitCrud()
    }
    return BenefitCrud.singleton
  }

  get permissions(): IEntityCrudPermissions{
    return {
      manage: 'benefit:manage', 
      view: 'benefit:view', 
      create: 'benefit:create', 
      update: 'benefit:update', 
      delete: 'benefit:delete'
    }
  }

  get headers(): IEntityCrudHeader[] {
    return [
      { title: 'title', key: 'title', align: 'start' },
      { title: 'company', key: 'company' },
      { title: 'category', key: 'category' },
      { title: 'image', key: 'image', sortable: false },
      { title: 'startDate', key: 'startDate' },
      { title: 'endDate', key: 'endDate' },
      { title: 'active', key: 'active' },
      { title: 'featured', key: 'featured' },
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
    return BenefitProvider.instance
  }
  
  get refs(): IEntityCrudRefs{
    return {
      Company: CompanyCrud.instance ,
Category: CategoryCrud.instance 
    }
  }

  get rules():IEntityCrudRules{
    return {
      title: [(v: any) => !!v || 'validation.required'],
company: [(v: any) => !!v || 'validation.required'],
category: [(v: any) => !!v || 'validation.required'],
startDate: [(v: any) => !!v || 'validation.required'],
endDate: [(v: any) => !!v || 'validation.required'],
conditions: [(v: any) => !!v || 'validation.required']
    }
  }

  get fields(): IEntityCrudField[]{
    return [
        {name:'title',type:'string',label:'title',default:''},
{name:'description',type:'longString',label:'description',default:''},
{name:'company',type:'ref',label:'company',default:null,ref: 'Company',refDisplay: 'name',cols:12,md:6},
{name:'category',type:'ref',label:'category',default:null,ref: 'Category',refDisplay: 'name',cols:12,md:6},
{name:'image',type:'file',label:'image',default:'',preview:true},
{name:'startDate',type:'date',label:'startDate',default:null},
{name:'endDate',type:'date',label:'endDate',default:null,endOfDay:true},
{name:'conditions',type:'longString',label:'conditions',default:''},
{name:'active',type:'boolean',label:'active',default:true},
{name:'featured',type:'boolean',label:'featured',default:false}
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
    return ['_id', 'title', 'company.name', 'category.name', 'startDate', 'endDate', 'active', 'featured']
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
    return false
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

export default BenefitCrud

