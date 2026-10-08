import {FileController} from '@drax/media-back';
import type {IFile} from '@drax/media-back';
import type {IRbac} from '@drax/identity-share';
import {ForbiddenError} from '@drax/common-back';

class BenefitsFileController extends FileController {
    protected assertUser(item: IFile, rbac: IRbac) {
        // Drax's base assertion uses item['createdBy.id'], not the nested owner.
        if (this.userAssert && item.createdBy?.id?.toString() !== rbac.userId) {
            throw new ForbiddenError();
        }
    }
}
export default BenefitsFileController;
