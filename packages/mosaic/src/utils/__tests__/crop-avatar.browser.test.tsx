import { describe, expect, it } from 'vitest';

import { INITIAL_CROP } from '../../primitives/image-cropper';
import { AVATAR_UPLOAD, cropAvatar } from '../avatar-upload';

async function noise(side: number, type: string, quality?: number): Promise<string> {
  const canvas = new OffscreenCanvas(side, side);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('expected a 2D canvas');
  }
  const image = context.createImageData(side, side);
  for (let at = 0; at < image.data.length; at += 65536) {
    crypto.getRandomValues(image.data.subarray(at, at + 65536));
  }
  for (let at = 3; at < image.data.length; at += 4) {
    image.data[at] = 255;
  }
  context.putImageData(image, 0, 0);
  return URL.createObjectURL(await canvas.convertToBlob({ type, quality }));
}

async function solid(side: number): Promise<string> {
  const canvas = new OffscreenCanvas(side, side);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('expected a 2D canvas');
  }
  context.fillStyle = 'rgb(255 0 0)';
  context.fillRect(0, 0, side, side);
  return URL.createObjectURL(await canvas.convertToBlob({ type: 'image/png' }));
}

async function side(blob: Blob): Promise<number> {
  const image = await createImageBitmap(blob);
  return image.width;
}

describe('cropAvatar', () => {
  it('keeps a crop that fits at the size of the square in the image', async () => {
    const blob = await cropAvatar(await solid(300), INITIAL_CROP, 'image/png');

    expect(await side(blob)).toBe(300);
  });

  it('shrinks a large image to 4096 pixels a side', async () => {
    const blob = await cropAvatar(await solid(6000), INITIAL_CROP, 'image/png');

    expect(await side(blob)).toBe(4096);
  });

  it('shrinks a crop that encodes over the size limit until it fits', async () => {
    const blob = await cropAvatar(await noise(2000, 'image/png'), INITIAL_CROP, 'image/png');

    expect(blob.size).toBeLessThanOrEqual(AVATAR_UPLOAD.maxSize);
    expect(blob.type).toBe('image/png');
    expect(await side(blob)).toBeGreaterThan(1000);
    expect(await side(blob)).toBeLessThan(2000);
  });

  it('fits a crop the browser saves as PNG because it cannot encode the picked type', async () => {
    const blob = await cropAvatar(await noise(2000, 'image/jpeg', 0.5), INITIAL_CROP, 'image/webp');

    expect(blob.size).toBeLessThanOrEqual(AVATAR_UPLOAD.maxSize);
  });

  it('fits a heavily compressed photo at the largest size', async () => {
    const blob = await cropAvatar(await noise(4096, 'image/jpeg', 0.3), INITIAL_CROP, 'image/jpeg');

    expect(blob.size).toBeLessThanOrEqual(AVATAR_UPLOAD.maxSize);
    expect(blob.type).toBe('image/jpeg');
  });
});
