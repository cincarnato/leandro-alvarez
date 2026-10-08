import { FileController } from '@drax/media-back';
import { ForbiddenError } from '@drax/common-back';
class BenefitsFileController extends FileController {
    assertUser(item, rbac) {
        // Drax's base assertion uses item['createdBy.id'], not the nested owner.
        if (this.userAssert && item.createdBy?.id?.toString() !== rbac.userId) {
            throw new ForbiddenError();
        }
    }
}
export default BenefitsFileController;
