import { type Crop, pixelCrop, turned } from './crop';

export interface CropImageOptions {
  /** Width and height of the output, in pixels. */
  size: number;
  /** Image type to encode, such as `image/png`. */
  type: string;
}

/**
 * Draws the square a crop shows into a new image.
 *
 * @example
 * const blob = await cropImage(objectUrl, crop, { size: 512, type: 'image/png' });
 */
export async function cropImage(src: string, crop: Crop, { size, type }: CropImageOptions): Promise<Blob> {
  const image = new Image();
  image.src = src;
  await image.decode();

  const natural = { width: image.naturalWidth, height: image.naturalHeight };
  const area = pixelCrop(crop, natural);
  const upright = turned(natural, crop.rotation);

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context is unavailable');
  }
  context.imageSmoothingQuality = 'high';
  context.scale(size / area.size, size / area.size);
  context.translate(upright.width / 2 - area.x, upright.height / 2 - area.y);
  context.rotate((crop.rotation * Math.PI) / 180);
  context.drawImage(image, -natural.width / 2, -natural.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not encode the cropped image'))), type);
  });
}
