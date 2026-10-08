
interface ICategoryBase {
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

interface ICategory {
    _id: string
    name: string
    description?: string
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICategoryBase, 
ICategory
}
