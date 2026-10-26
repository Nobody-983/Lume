export const IMAGE_ACCEPT = 'image/jpeg,image/png';

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dimensions);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Lumé could not read this image. Try a different JPG or PNG.'));
    };
    image.src = url;
  });
}

export async function validateImageFile(
  file,
  {
    maxMb = 10,
    minShortSide = 480,
    minLongSide = 0,
    maxLongSide = 0,
    label = 'image',
  } = {},
) {
  if (!file) throw new Error(`Choose a ${label} first.`);
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Use a JPG or PNG image.');
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Keep this ${label} under ${maxMb} MB.`);
  }

  const dimensions = await getDimensions(file);
  const shortSide = Math.min(dimensions.width, dimensions.height);
  const longSide = Math.max(dimensions.width, dimensions.height);

  if (shortSide < minShortSide) {
    throw new Error(
      `This ${label} is ${dimensions.width}×${dimensions.height}. Use an image at least ${minShortSide}px on the short side.`,
    );
  }
  if (minLongSide && longSide < minLongSide) {
    throw new Error(`This ${label} needs to be at least ${minLongSide}px on its long side.`);
  }
  if (maxLongSide && longSide > maxLongSide) {
    throw new Error(`This ${label} is larger than ${maxLongSide}px on its long side.`);
  }

  return { ...dimensions, size: file.size, name: file.name, type: file.type };
}

export function createPreview(file) {
  return URL.createObjectURL(file);
}

export function releasePreview(url) {
  if (url) URL.revokeObjectURL(url);
}

export async function resizeImageToMinShortSide(file, minShortSide, label = 'image') {
  if (!file) throw new Error(`Choose a ${label} first.`);
  const dimensions = await getDimensions(file);
  const shortSide = Math.min(dimensions.width, dimensions.height);
  if (shortSide >= minShortSide) {
    return file;
  }

  const scale = minShortSide / shortSide;
  const targetWidth = Math.round(dimensions.width * scale);
  const targetHeight = Math.round(dimensions.height * scale);

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

    const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    const blob = await new Promise((resolve) => {
      if (mimeType === 'image/png') {
        canvas.toBlob(resolve, mimeType);
      } else {
        canvas.toBlob(resolve, mimeType, 0.92);
      }
    });

    if (!blob) throw new Error('Lumé could not resize this image.');

    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const baseName = (file.name || `${label}.jpg`).replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}-resized.${extension}`, { type: mimeType });
  } finally {
    URL.revokeObjectURL(url);
  }
}
