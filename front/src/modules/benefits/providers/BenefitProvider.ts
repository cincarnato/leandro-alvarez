
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IBenefit, IBenefitBase} from '../interfaces/IBenefit'

class BenefitProvider extends AbstractCrudRestProvider<IBenefit, IBenefitBase, IBenefitBase> {
    
  static singleton: BenefitProvider
    
  constructor() {
   super('/api/benefit')
  }
  
  static get instance() {
    if(!BenefitProvider.singleton){
      BenefitProvider.singleton = new BenefitProvider()
    }
    return BenefitProvider.singleton
  }

}

export default BenefitProvider

