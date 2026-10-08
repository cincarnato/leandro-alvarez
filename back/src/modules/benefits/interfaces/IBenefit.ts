
interface IBenefitBase {
    title: string
    description?: string
    company: any
    category: any
    image?: string
    startDate: Date
    endDate: Date
    conditions: string
    active?: boolean
    featured?: boolean
    createdAt?: Date
    updatedAt?: Date
}

interface IBenefit {
    _id: string
    title: string
    description?: string
    company: any
    category: any
    image?: string
    startDate: Date
    endDate: Date
    conditions: string
    active?: boolean
    featured?: boolean
    createdAt?: Date
    updatedAt?: Date
}

export type {
IBenefitBase, 
IBenefit
}
