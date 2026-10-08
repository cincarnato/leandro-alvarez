
import type {IBenefit, IBenefitBase} from './IBenefit'
import {IDraxCrudRepository} from "@drax/crud-share";

interface IBenefitRepository extends IDraxCrudRepository<IBenefit, IBenefitBase, IBenefitBase>{

}

export {IBenefitRepository}


