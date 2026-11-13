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

interface SolidOptions {
  colorSpace?: PredefinedColorSpace;
}

function leftHalf(fill: string, { colorSpace = 'srgb' }: SolidOptions = {}): string {
  const width = 100;
  const height = 100;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { colorSpace });
  if (!context) {
    throw new Error('no canvas');
  }
  context.fillStyle = fill;
  context.fillRect(0, 0, width / 2, height);
  return canvas.toDataURL('image/png');
}

async function pixels(blob: Blob, colorSpace: PredefinedColorSpace = 'srgb') {
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d', { colorSpace });
  if (!context) {
    throw new Error('no canvas');
  }
  context.drawImage(bitmap, 0, 0);
  const at = (x: number, y: number) => [...context.getImageData(x, y, 1, 1, { colorSpace }).data];
  return { width: bitmap.width, height: bitmap.height, at };
}

describe('cropImage', () => {
  it('draws the square the frame shows at the requested size and type', async () => {
    const blob = await cropImage(halves(200, 100), INITIAL_CROP, { type: 'image/png', size: () => 64 });
    const image = await pixels(blob);

    expect(blob.type).toBe('image/png');
    expect([image.width, image.height]).toEqual([64, 64]);
    expect(image.at(8, 32)).toEqual([...RED, 255]);
    expect(image.at(56, 32)).toEqual([...BLUE, 255]);
  });

  it('draws at the size of the square in the image, without scaling it, by default', async () => {
    const blob = await cropImage(halves(200, 100), INITIAL_CROP, { type: 'image/png' });
    const image = await pixels(blob);

    expect([image.width, image.height]).toEqual([100, 100]);
  });

  it('draws a zoomed crop at the size it covers in the image', async () => {
    const blob = await cropImage(halves(200, 100), { ...INITIAL_CROP, zoom: 3 }, { type: 'image/png' });
    const image = await pixels(blob);

    expect([image.width, image.height]).toEqual([33, 33]);
  });

  it('passes the size of the square in the image to size', async () => {
    const sides: number[] = [];
    await cropImage(
      halves(200, 100),
      { ...INITIAL_CROP, zoom: 2 },
      {
        type: 'image/png',
        size: side => {
          sides.push(side);
          return side;
        },
      },
    );

    expect(sides).toEqual([50]);
  });

  it('encodes the requested type', async () => {
    const blob = await cropImage(halves(200, 100), INITIAL_CROP, { type: 'image/jpeg' });

    expect(blob.type).toBe('image/jpeg');
  });

  it('keeps transparency', async () => {
    const blob = await cropImage(leftHalf('rgb(255 0 0)'), INITIAL_CROP, { type: 'image/png' });
    const image = await pixels(blob);

    expect(image.at(10, 50)).toEqual([...RED, 255]);
    expect(image.at(90, 50)).toEqual([0, 0, 0, 0]);
  });

  it('keeps colors outside sRGB', async () => {
    const src = leftHalf('color(display-p3 1 0 0)', { colorSpace: 'display-p3' });
    const blob = await cropImage(src, INITIAL_CROP, { type: 'image/png' });
    const image = await pixels(blob, 'display-p3');

    expect(image.at(10, 50)).toEqual([...RED, 255]);
  });

  it('follows a pan', async () => {
    const blob = await cropImage(halves(200, 100), { ...INITIAL_CROP, x: 0.5 }, { type: 'image/png', size: () => 64 });
    const image = await pixels(blob);

    expect(image.at(8, 32)).toEqual([...RED, 255]);
    expect(image.at(56, 32)).toEqual([...RED, 255]);
  });

  it('follows a quarter turn', async () => {
    const blob = await cropImage(
      halves(200, 100),
      { ...INITIAL_CROP, rotation: 90 },
      { type: 'image/png', size: () => 64 },
    );
    const image = await pixels(blob);

    expect(image.at(32, 8)).toEqual([...RED, 255]);
    expect(image.at(32, 56)).toEqual([...BLUE, 255]);
  });

  it('leaves the frame around a zoomed out image empty', async () => {
    const blob = await cropImage(halves(200, 100), { ...INITIAL_CROP, zoom: 0.5 }, { type: 'image/png' });
    const image = await pixels(blob);

    expect([image.width, image.height]).toEqual([200, 200]);
    expect(image.at(50, 25)).toEqual([0, 0, 0, 0]);
    expect(image.at(50, 100)).toEqual([...RED, 255]);
    expect(image.at(150, 100)).toEqual([...BLUE, 255]);
    expect(image.at(150, 175)).toEqual([0, 0, 0, 0]);
  });

  it('clamps a crop that would leave part of the square outside the image', async () => {
    const blob = await cropImage(halves(100, 100), { ...INITIAL_CROP, x: 0.5 }, { type: 'image/png', size: () => 64 });
    const image = await pixels(blob);

    expect(image.at(8, 32)).toEqual([...RED, 255]);
    expect(image.at(56, 32)).toEqual([...BLUE, 255]);
  });
});
