
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {ICompany, ICompanyBase} from '../interfaces/ICompany'

class CompanyProvider extends AbstractCrudRestProvider<ICompany, ICompanyBase, ICompanyBase> {
    
  static singleton: CompanyProvider
    
  constructor() {
   super('/api/company')
  }
  
  async userOptions(search = ''): Promise<ICompany['users']> {
    return await this.httpClient.get(`${this.basePath}/user-options?${new URLSearchParams({ search })}`) as ICompany['users']
  }

  static get instance() {
    if(!CompanyProvider.singleton){
      CompanyProvider.singleton = new CompanyProvider()
    }
    return CompanyProvider.singleton
  }

}

export default CompanyProvider

