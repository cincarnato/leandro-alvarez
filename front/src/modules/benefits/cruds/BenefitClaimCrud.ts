// Query-only metadata: intentionally not an EntityCrud (claims have no mutations).
export default class BenefitClaimCrud {
  static instance = new BenefitClaimCrud()
  name = 'BenefitClaim'
  rowKey = 'token'
  isCreatable = false
  isEditable = false
  isDeletable = false
  isImportable = false
  isExportable = false
}
