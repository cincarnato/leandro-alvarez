
import type {ICompany, ICompanyBase} from './ICompany'
import {IDraxCrudRepository} from "@drax/crud-share";

interface ICompanyRepository extends IDraxCrudRepository<ICompany, ICompanyBase, ICompanyBase>{
    findByUser(userId: string): Promise<ICompany[]>;

}

export {ICompanyRepository}


