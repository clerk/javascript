/** A quarter turn, clockwise, in degrees. */
export type Rotation = 0 | 90 | 180 | 270;

/**
 * Where the image sits in the square frame. `x` and `y` move the image centre from the frame
 * centre, as a fraction of the frame. `zoom` 1 is the smallest scale that still covers the frame,
 * and below 1 the whole image fits inside it, down to `minZoom`.
 */
export interface Crop {
  x: number;
  y: number;
  zoom: number;
  rotation: Rotation;
}

export interface Size {
  width: number;
  height: number;
}

/** The square to cut from the image after it is turned by `rotation`, in image pixels. */
export interface PixelCrop {
  x: number;
  y: number;
  size: number;
}

export const INITIAL_CROP: Crop = { x: 0, y: 0, zoom: 1, rotation: 0 };

/** How much one zoom in or out step scales the image, from a button or the keyboard. */
export const ZOOM_STEP = 1.25;

/**
 * The smallest zoom, where the whole image fits in the frame.
 *
 * @example
 * minZoom({ width: 200, height: 100 }) // 0.5
 */
export function minZoom(size: Size): number {
  return Math.min(size.width, size.height) / Math.max(size.width, size.height);
}

/**
 * Keeps zoom between `minZoom` and `maxZoom`, and stops each edge of the image at the frame's: an
 * image larger than the frame still covers it, and one smaller than the frame stays inside it.
 *
 * @example
 * clampCrop({ x: 2, y: 0, zoom: 1, rotation: 0 }, { width: 200, height: 100 }, 4) // x: 0.5
 */
export function clampCrop(crop: Crop, size: Size, maxZoom: number): Crop {
  const zoom = clamp(crop.zoom, minZoom(size), maxZoom);
  const { width, height } = turned(size, crop.rotation);
  const short = Math.min(width, height);
  const rangeX = Math.abs((width / short) * zoom - 1) / 2;
  const rangeY = Math.abs((height / short) * zoom - 1) / 2;
  return { x: clamp(crop.x, -rangeX, rangeX), y: clamp(crop.y, -rangeY, rangeY), zoom, rotation: crop.rotation };
}

/**
 * Zooms around the frame centre, so the point under it stays put.
 *
 * @example
 * zoomCrop(crop, crop.zoom * 1.1, size, 4)
 */
export function zoomCrop(crop: Crop, zoom: number, size: Size, maxZoom: number): Crop {
  const next = clamp(zoom, minZoom(size), maxZoom);
  const ratio = next / crop.zoom;
  return clampCrop({ ...crop, x: crop.x * ratio, y: crop.y * ratio, zoom: next }, size, maxZoom);
}

/**
 * Turns the image a quarter clockwise around the frame centre.
 *
 * @example
 * rotateCrop(crop, size, 4)
 */
export function rotateCrop(crop: Crop, size: Size, maxZoom: number): Crop {
  return clampCrop({ ...crop, x: -crop.y, y: crop.x, rotation: nextRotation(crop.rotation) }, size, maxZoom);
}

/**
 * The square the frame shows, in pixels of the image after it is turned by `crop.rotation`.
 *
 * @example
 * pixelCrop({ x: 0, y: 0, zoom: 2, rotation: 0 }, { width: 200, height: 100 }) // { x: 75, y: 25, size: 50 }
 */
export function pixelCrop(crop: Crop, size: Size): PixelCrop {
  const { width, height } = turned(size, crop.rotation);
  const side = Math.min(width, height) / crop.zoom;
  return {
    x: width / 2 - crop.x * side - side / 2,
    y: height / 2 - crop.y * side - side / 2,
    size: side,
  };
}

export function turned(size: Size, rotation: Rotation): Size {
  return rotation === 90 || rotation === 270 ? { width: size.height, height: size.width } : size;
}

function nextRotation(rotation: Rotation): Rotation {
  switch (rotation) {
    case 0:
      return 90;
    case 90:
      return 180;
    case 180:
      return 270;
    case 270:
      return 0;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max) + 0;
}
