import { ApiError } from './errors.js';

const MIN_SHORT_SIDE = 1080;

function getDimensions(buffer) {
  // Try to get dimensions from common image headers
  if (buffer.length < 24) return null;
  
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height, type: 'png' };
  }
  
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let i = 2;
    while (i < buffer.length - 9) {
      if (buffer[i] === 0xff) {
        const marker = buffer[i + 1];
        if (marker === 0xc0 || marker === 0xc2) {
          const height = buffer.readUInt16BE(i + 5);
          const width = buffer.readUInt16BE(i + 7);
          return { width, height, type: 'jpeg' };
        }
        const length = buffer.readUInt16BE(i + 2);
        i += 2 + length;
        continue;
      }
      i++;
    }
  }
  
  return null;
}

export async function ensureMinDimensions(file, minShortSide = MIN_SHORT_SIDE) {
  const dims = getDimensions(file.buffer);
  if (!dims) return file;
  
  const shortSide = Math.min(dims.width, dims.height);
  if (shortSide >= minShortSide) {
    return file;
  }
  
  throw new ApiError(
    400,
    'IMAGE_TOO_SMALL',
    `This portrait is ${dims.width}×${dims.height}. Skin AI (HD) requires a portrait at least ${minShortSide}px on the short side. Please upload a larger image. Upscaling is not available server-side; use a higher resolution photo.`
  );
}
