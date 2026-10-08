import { CommonConfig, DraxConfig, StoreManager, UploadFileError } from '@drax/common-back';
export const MAX_RASTER_UPLOAD_SIZE = 5 * 1024 * 1024;
export function rasterUploadSizeLimit() {
    const configured = Number(DraxConfig.getOrLoad(CommonConfig.MaxUploadSize));
    return Number.isSafeInteger(configured) && configured > 0
        ? Math.min(configured, MAX_RASTER_UPLOAD_SIZE) : MAX_RASTER_UPLOAD_SIZE;
}
const formats = {
    'image/png': ['png'], 'image/jpeg': ['jpg', 'jpeg'],
    'image/webp': ['webp'], 'image/gif': ['gif'],
};
export function assertRasterMetadata(filename, mimetype) {
    const extensions = formats[mimetype];
    if (!filename || /[\\/\x00-\x1f\x7f]/.test(filename) ||
        !extensions?.includes(StoreManager.getExtension(filename).toLowerCase())) {
        throw new UploadFileError('Only PNG, JPEG, WebP and GIF images with matching MIME and extension are allowed');
    }
}
function isPng(bytes) {
    if (bytes.length < 45 || !bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) ||
        bytes.readUInt32BE(8) !== 13 || bytes.toString('ascii', 12, 16) !== 'IHDR' ||
        !bytes.readUInt32BE(16) || !bytes.readUInt32BE(20))
        return false;
    let hasImageData = false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
        const length = bytes.readUInt32BE(offset);
        const end = offset + length + 12;
        if (end > bytes.length)
            return false;
        const type = bytes.toString('ascii', offset + 4, offset + 8);
        if (type === 'IDAT' && length > 0)
            hasImageData = true;
        if (type === 'IEND')
            return length === 0 && end === bytes.length && hasImageData;
        offset = end;
    }
    return false;
}
function isJpeg(bytes) {
    if (bytes.length < 12 || bytes.readUInt16BE(0) !== 0xffd8 || bytes.readUInt16BE(bytes.length - 2) !== 0xffd9)
        return false;
    let hasFrame = false;
    for (let offset = 2; offset + 4 <= bytes.length;) {
        if (bytes[offset++] !== 0xff)
            return false;
        while (bytes[offset] === 0xff)
            offset++;
        const marker = bytes[offset++];
        if (offset + 2 > bytes.length)
            return false;
        const length = bytes.readUInt16BE(offset);
        if (length < 2 || offset + length > bytes.length)
            return false;
        if ([0xc0, 0xc1, 0xc2].includes(marker)) {
            if (length < 8 || !bytes.readUInt16BE(offset + 3) || !bytes.readUInt16BE(offset + 5))
                return false;
            hasFrame = true;
        }
        if (marker === 0xda)
            return hasFrame && length >= 6 && offset + length < bytes.length - 2;
        offset += length;
    }
    return false;
}
function isWebp(bytes) {
    if (bytes.length < 25 || bytes.toString('ascii', 0, 4) !== 'RIFF' ||
        bytes.toString('ascii', 8, 12) !== 'WEBP' || bytes.readUInt32LE(4) !== bytes.length - 8)
        return false;
    let hasImageData = false;
    for (let offset = 12; offset + 8 <= bytes.length;) {
        const type = bytes.toString('ascii', offset, offset + 4);
        const length = bytes.readUInt32LE(offset + 4);
        const start = offset + 8;
        const end = start + length + (length % 2);
        if (end > bytes.length)
            return false;
        if (type === 'VP8 ') {
            if (length < 10 || !bytes.subarray(start + 3, start + 6).equals(Buffer.from('9d012a', 'hex')) ||
                !(bytes.readUInt16LE(start + 6) & 0x3fff) || !(bytes.readUInt16LE(start + 8) & 0x3fff))
                return false;
            hasImageData = true;
        }
        if (type === 'VP8L') {
            if (length < 5 || bytes[start] !== 0x2f)
                return false;
            hasImageData = true;
        }
        if (end === bytes.length)
            return hasImageData;
        offset = end;
    }
    return false;
}
function isGif(bytes) {
    if (bytes.length < 26 || !['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)) ||
        !bytes.readUInt16LE(6) || !bytes.readUInt16LE(8))
        return false;
    let offset = 13 + ((bytes[10] & 0x80) ? 3 * (1 << ((bytes[10] & 7) + 1)) : 0);
    let hasImageData = false;
    const skipBlocks = () => {
        while (offset < bytes.length) {
            const length = bytes[offset++];
            if (!length)
                return true;
            offset += length;
            if (offset > bytes.length)
                return false;
        }
        return false;
    };
    while (offset < bytes.length) {
        const marker = bytes[offset++];
        if (marker === 0x3b)
            return hasImageData && offset === bytes.length;
        if (marker === 0x21) {
            offset++; // Extension label, followed by data sub-blocks.
            if (!skipBlocks())
                return false;
        }
        else if (marker === 0x2c) {
            if (offset + 9 > bytes.length || !bytes.readUInt16LE(offset + 4) || !bytes.readUInt16LE(offset + 6))
                return false;
            const packed = bytes[offset + 8];
            offset += 9 + ((packed & 0x80) ? 3 * (1 << ((packed & 7) + 1)) : 0);
            const codeSize = bytes[offset++];
            if (codeSize < 2 || codeSize > 8 || offset >= bytes.length || bytes[offset] === 0 || !skipBlocks())
                return false;
            hasImageData = true;
        }
        else
            return false;
    }
    return false;
}
export function assertRasterImage(bytes, filename, mimetype) {
    assertRasterMetadata(filename, mimetype);
    const valid = mimetype === 'image/png' ? isPng(bytes)
        : mimetype === 'image/jpeg' ? isJpeg(bytes)
            : mimetype === 'image/webp' ? isWebp(bytes)
                : isGif(bytes);
    if (!valid)
        throw new UploadFileError('Invalid or truncated raster image');
}
