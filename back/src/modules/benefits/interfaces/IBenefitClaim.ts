
interface IBenefitClaimBase {
    benefit: any
    token: string
    redeemedAt?: Date | null
    redeemedBy?: any
    createdAt?: Date
    updatedAt?: Date
}

interface IBenefitClaim {
    _id: string
    benefit: any
    token: string
    redeemedAt?: Date | null
    redeemedBy?: any
    createdAt?: Date
    updatedAt?: Date
}

export type {
IBenefitClaimBase, 
IBenefitClaim
}
