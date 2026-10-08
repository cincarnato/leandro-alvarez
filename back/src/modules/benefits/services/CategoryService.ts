
import type{ICategoryRepository} from "../interfaces/ICategoryRepository";
import type {ICategoryBase, ICategory} from "../interfaces/ICategory";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class CategoryService extends AbstractService<ICategory, ICategoryBase, ICategoryBase> {


    constructor(CategoryRepository: ICategoryRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CategoryRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

}

export default CategoryService
export {CategoryService}
