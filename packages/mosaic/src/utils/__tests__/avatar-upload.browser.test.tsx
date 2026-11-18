import { describe, expect, it } from 'vitest';

import { croppedFile, skipsCrop } from '../avatar-upload';

const ascii = (text: string) => [...text].map(char => char.charCodeAt(0));
const uint32 = (value: number) => [value >>> 24, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];

function png(...chunks: Array<[type: string, length: number]>): File {
  const bytes = [0x89, ...ascii('PNG'), 0x0d, 0x0a, 0x1a, 0x0a];
  for (const [type, length] of chunks) {
    bytes.push(...uint32(length), ...ascii(type), ...new Array<number>(length).fill(0), 0, 0, 0, 0);
  }
  return new File([new Uint8Array(bytes)], 'me.png', { type: 'image/png' });
}

function webp(chunk: string, flags = 0): File {
  const bytes = [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP'), ...ascii(chunk), 10, 0, 0, 0, flags, 0, 0, 0];
  return new File([new Uint8Array(bytes)], 'me.webp', { type: 'image/webp' });
}

describe('skipsCrop', () => {
  it.each([
    ['a GIF', true, new File(['GIF89a'], 'me.gif', { type: 'image/gif' })],
    ['an animated PNG', true, png(['IHDR', 13], ['acTL', 8], ['IDAT', 4], ['IEND', 0])],
    ['an animated PNG with chunks before acTL', true, png(['IHDR', 13], ['iCCP', 300], ['acTL', 8], ['IDAT', 4])],
    ['a still PNG', false, png(['IHDR', 13], ['IDAT', 4], ['IEND', 0])],
    ['a PNG with acTL after its image data', false, png(['IHDR', 13], ['IDAT', 4], ['acTL', 8])],
    [
      'a cut-off PNG',
      false,
      new File([png(['IHDR', 13], ['iCCP', 300]).slice(0, 40)], 'me.png', { type: 'image/png' }),
    ],
    ['an animated WebP', true, webp('VP8X', 0x02)],
    ['an extended WebP that does not animate', false, webp('VP8X', 0x10)],
    ['a lossy WebP', false, webp('VP8 ')],
    ['a lossless WebP', false, webp('VP8L')],
    ['a JPEG', false, new File([new Uint8Array([0xff, 0xd8, 0xff])], 'me.jpg', { type: 'image/jpeg' })],
  ])('for %s is %s', async (_, expected, file) => {
    expect(await skipsCrop(file)).toBe(expected);
  });
});

describe('croppedFile', () => {
  it.each([
    ['me.jpeg', 'image/jpeg', 'image/jpeg', 'me.jpeg'],
    ['me.webp', 'image/webp', 'image/webp', 'me.webp'],
    ['me.webp', 'image/webp', 'image/png', 'me.png'],
    ['me.PNG', 'image/png', 'image/png', 'me.PNG'],
    ['photo.final.jpg', 'image/jpeg', 'image/jpeg', 'photo.final.jpg'],
    ['me', 'image/webp', 'image/png', 'me.png'],
  ])('names a crop of %s (%s) saved as %s %j', (name, pickedType, savedType, expected) => {
    const file = croppedFile(new File(['x'], name, { type: pickedType }), new Blob(['y'], { type: savedType }));

    expect(file).toMatchObject({ name: expected, type: savedType });
  });
});
