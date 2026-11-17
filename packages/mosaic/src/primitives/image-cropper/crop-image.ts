import { clampCrop, type Crop, pixelCrop, turned } from './crop';

export interface CropImageOptions {
  /** Image type to encode, such as `image/png`. A browser that cannot encode it falls back to `image/png`. */
  type: string;
  /** Width and height of the output, given the side of the square in the image's own pixels. Defaults to that side. */
  size?: (side: number) => number;
}

/**
 * Draws the square a crop shows into a new image.
 *
 * @example
 * const blob = await cropImage(objectUrl, crop, { type: file.type, size: side => Math.min(side, 1024) });
 */
export async function cropImage(
  src: string,
  crop: Crop,
  { type, size = side => side }: CropImageOptions,
): Promise<Blob> {
  const image = new Image();
  image.src = src;
  await image.decode();

  const natural = { width: image.naturalWidth, height: image.naturalHeight };
  const area = pixelCrop(clampCrop(crop, natural, Number.POSITIVE_INFINITY), natural);
  const upright = turned(natural, crop.rotation);

  const side = Math.max(1, Math.round(size(area.size)));
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext('2d', { colorSpace: 'display-p3' });
  if (!context) {
    throw new Error('Canvas 2D context is unavailable');
  }
  context.imageSmoothingQuality = 'high';
  context.scale(side / area.size, side / area.size);
  context.translate(upright.width / 2 - area.x, upright.height / 2 - area.y);
  context.rotate((crop.rotation * Math.PI) / 180);
  context.drawImage(image, -natural.width / 2, -natural.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not encode the cropped image'))), type);
  });
}
