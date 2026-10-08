import { Readable } from 'node:stream';
import { CommonController, UploadFileError } from '@drax/common-back';
import { MediaPermissions, MediaService } from '@drax/media-back';
import { assertRasterImage, assertRasterMetadata, rasterUploadSizeLimit } from '../services/RasterImageUpload.js';
class BenefitsMediaController extends CommonController {
    constructor() {
        super(...arguments);
        this.mediaService = new MediaService();
    }
    async uploadFile(request, reply) {
        try {
            request.rbac.assertPermission(MediaPermissions.UploadFile);
            const data = await request.file({
                throwFileSizeLimit: true,
                limits: { fileSize: rasterUploadSizeLimit(), files: 1, fields: 0, parts: 1 },
            });
            if (!data)
                throw new UploadFileError('An image file is required');
            try {
                assertRasterMetadata(data.filename, data.mimetype);
            }
            catch (error) {
                data.file.resume();
                throw error;
            }
            // toBuffer is bounded by the per-file multipart limit, never unbounded.
            // Validate before delegating storage/metadata to Drax: no invalid files persist.
            const bytes = await data.toBuffer();
            if (data.file.truncated)
                return reply.code(413).send({ error: 'upload_too_large' });
            assertRasterImage(bytes, data.filename, data.mimetype);
            const storedFile = await this.mediaService.saveFile({
                dir: request.params.dir,
                file: { filename: data.filename, fileStream: Readable.from(bytes), mimetype: data.mimetype, encoding: data.encoding },
                createdBy: { id: request.rbac.userId, username: request.rbac.username },
            });
            return { filename: storedFile.filename, filepath: storedFile.relativePath, size: storedFile.size,
                mimetype: storedFile.mimetype, url: storedFile.url };
        }
        catch (error) {
            if (error.code === 'FST_REQ_FILE_TOO_LARGE')
                return reply.code(413).send({ error: 'upload_too_large' });
            if (['FST_FILES_LIMIT', 'FST_FIELDS_LIMIT', 'FST_PARTS_LIMIT', 'FST_INVALID_MULTIPART_CONTENT_TYPE'].includes(error.code)) {
                return reply.code(400).send({ error: 'invalid_multipart_upload' });
            }
            this.handleError(error, reply);
        }
    }
}
export default BenefitsMediaController;
