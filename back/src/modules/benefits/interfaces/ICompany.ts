
interface ICompanyUser {
    _id: string
    name: string
    username: string
}

interface ICompanyBase {
    users?: string[]
    name: string
    description?: string
    logo?: string
    cuit?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    active?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface ICompany {
    users?: ICompanyUser[]
    _id: string
    name: string
    description?: string
    logo?: string
    cuit?: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    active?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
ICompanyBase, 
ICompany
}
