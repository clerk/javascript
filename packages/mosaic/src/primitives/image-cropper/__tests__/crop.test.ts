import { describe, expect, it } from 'vitest';

import { clampCrop, type Crop, INITIAL_CROP, pixelCrop, rotateCrop, zoomCrop } from '../crop';

const wide = { width: 200, height: 100 };
const tall = { width: 100, height: 200 };
const square = { width: 100, height: 100 };
const maxZoom = 4;

function crop(overrides: Partial<Crop>): Crop {
  return { ...INITIAL_CROP, ...overrides };
}

describe('clampCrop', () => {
  it('lets a wide image pan sideways until its edge meets the frame', () => {
    expect(clampCrop(crop({ x: 2, y: 2 }), wide, maxZoom)).toEqual(crop({ x: 0.5, y: 0 }));
    expect(clampCrop(crop({ x: -2 }), wide, maxZoom)).toEqual(crop({ x: -0.5 }));
  });

  it('lets a tall image pan up and down until its edge meets the frame', () => {
    expect(clampCrop(crop({ x: 2, y: -2 }), tall, maxZoom)).toEqual(crop({ x: 0, y: -0.5 }));
  });

  it('widens the pan range as the image zooms in', () => {
    expect(clampCrop(crop({ x: 5, y: 5, zoom: 2 }), square, maxZoom)).toEqual(crop({ x: 0.5, y: 0.5, zoom: 2 }));
  });

  it('keeps zoom between fitting the whole image in the frame and the max', () => {
    expect(clampCrop(crop({ zoom: 0.1 }), wide, maxZoom).zoom).toBe(0.5);
    expect(clampCrop(crop({ zoom: 0.1 }), tall, maxZoom).zoom).toBe(0.5);
    expect(clampCrop(crop({ zoom: 0.5 }), square, maxZoom).zoom).toBe(1);
    expect(clampCrop(crop({ zoom: 9 }), square, maxZoom).zoom).toBe(4);
  });

  it('keeps an image smaller than the frame inside it', () => {
    expect(clampCrop(crop({ x: 2, y: 2, zoom: 0.5 }), wide, maxZoom)).toEqual(crop({ x: 0, y: 0.25, zoom: 0.5 }));
    expect(clampCrop(crop({ x: -2, y: -2, zoom: 0.5 }), wide, maxZoom)).toEqual(crop({ x: 0, y: -0.25, zoom: 0.5 }));
  });

  it('swaps the pan axes for an image turned a quarter', () => {
    expect(clampCrop(crop({ x: 2, y: 2, rotation: 90 }), wide, maxZoom)).toEqual(crop({ x: 0, y: 0.5, rotation: 90 }));
  });
});

describe('zoomCrop', () => {
  it('keeps the point under the centre of the frame in place', () => {
    expect(zoomCrop(crop({ x: 0.25, zoom: 2 }), 4, square, maxZoom)).toEqual(crop({ x: 0.5, zoom: 4 }));
  });

  it('pulls the pan back inside the image when zooming out', () => {
    expect(zoomCrop(crop({ x: 1.5, zoom: 2 }), 1, wide, maxZoom)).toEqual(crop({ x: 0.5, zoom: 1 }));
  });

  it('zooms out until the whole image fits in the frame', () => {
    expect(zoomCrop(crop({ x: 0.5 }), 0.1, wide, maxZoom)).toEqual(crop({ x: 0, zoom: 0.5 }));
  });
});

describe('rotateCrop', () => {
  it('turns the image a quarter clockwise around the centre of the frame', () => {
    expect(rotateCrop(crop({ x: 0.5 }), wide, maxZoom)).toEqual(crop({ x: 0, y: 0.5, rotation: 90 }));
  });

  it('wraps back to upright after four turns', () => {
    expect(rotateCrop(crop({ rotation: 270 }), square, maxZoom).rotation).toBe(0);
  });
});

describe('pixelCrop', () => {
  it('takes the whole of a square image at rest', () => {
    expect(pixelCrop(INITIAL_CROP, square)).toEqual({ x: 0, y: 0, size: 100 });
  });

  it('takes the middle of a wide image at rest', () => {
    expect(pixelCrop(INITIAL_CROP, wide)).toEqual({ x: 50, y: 0, size: 100 });
  });

  it('takes the left side when the image is panned right', () => {
    expect(pixelCrop(crop({ x: 0.5 }), wide)).toEqual({ x: 0, y: 0, size: 100 });
  });

  it('takes a smaller square when zoomed in', () => {
    expect(pixelCrop(crop({ zoom: 2 }), wide)).toEqual({ x: 75, y: 25, size: 50 });
  });

  it('takes a square larger than the image when zoomed out', () => {
    expect(pixelCrop(crop({ zoom: 0.5 }), wide)).toEqual({ x: 0, y: -50, size: 200 });
  });

  it('measures from the turned image', () => {
    expect(pixelCrop(crop({ y: 0.5, rotation: 90 }), wide)).toEqual({ x: 0, y: 0, size: 100 });
  });
});
