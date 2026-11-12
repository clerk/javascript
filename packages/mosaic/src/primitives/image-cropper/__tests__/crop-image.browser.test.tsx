import { describe, expect, it } from 'vitest';

import { INITIAL_CROP } from '../crop';
import { cropImage } from '../crop-image';

const RED = [255, 0, 0];
const BLUE = [0, 0, 255];

function halves(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('no canvas');
  }
  context.fillStyle = 'rgb(255 0 0)';
  context.fillRect(0, 0, width / 2, height);
  context.fillStyle = 'rgb(0 0 255)';
  context.fillRect(width / 2, 0, width / 2, height);
  return canvas.toDataURL('image/png');
}

async function pixels(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('no canvas');
  }
  context.drawImage(bitmap, 0, 0);
  const at = (x: number, y: number) => [...context.getImageData(x, y, 1, 1).data.slice(0, 3)];
  return { width: bitmap.width, height: bitmap.height, at };
}

describe('cropImage', () => {
  it('draws the square the frame shows at the requested size and type', async () => {
    const blob = await cropImage(halves(200, 100), INITIAL_CROP, { size: 64, type: 'image/png' });
    const image = await pixels(blob);

    expect(blob.type).toBe('image/png');
    expect([image.width, image.height]).toEqual([64, 64]);
    expect(image.at(8, 32)).toEqual(RED);
    expect(image.at(56, 32)).toEqual(BLUE);
  });

  it('follows a pan', async () => {
    const blob = await cropImage(halves(200, 100), { ...INITIAL_CROP, x: 0.5 }, { size: 64, type: 'image/png' });
    const image = await pixels(blob);

    expect(image.at(8, 32)).toEqual(RED);
    expect(image.at(56, 32)).toEqual(RED);
  });

  it('follows a quarter turn', async () => {
    const blob = await cropImage(halves(200, 100), { ...INITIAL_CROP, rotation: 90 }, { size: 64, type: 'image/png' });
    const image = await pixels(blob);

    expect(image.at(32, 8)).toEqual(RED);
    expect(image.at(32, 56)).toEqual(BLUE);
  });
});
