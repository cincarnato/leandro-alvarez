
import type { IUser } from '@drax/identity-share'

interface ICompanyBase {
    name: string
    users: string[]
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
    _id: string
    name: string
    users: Pick<IUser, '_id' | 'name' | 'username'>[]
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
