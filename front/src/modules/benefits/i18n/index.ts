
import merge from "deepmerge";
import CompanyMessages from "./Company-i18n"
import CategoryMessages from "./Category-i18n"
import BenefitMessages from "./Benefit-i18n"
import BenefitClaimMessages from "./BenefitClaim-i18n"
import MvpMessages from './Mvp-i18n'

const messages = merge.all([
    CompanyMessages,
    CategoryMessages,
    BenefitMessages,
    BenefitClaimMessages,
        MvpMessages
])

export default messages
