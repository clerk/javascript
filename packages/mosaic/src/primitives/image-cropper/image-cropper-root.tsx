'use client';

import { type ReactNode, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { clampCrop, type Crop, INITIAL_CROP, minZoom, rotateCrop, type Size, zoomCrop } from './crop';
import { ImageCropperContext, type ImageCropperContextValue } from './image-cropper-context';

export interface ImageCropperRootProps {
  /** The image to crop, such as an object URL for a picked file. */
  src: string;
  /** Controlled crop. */
  value?: Crop;
  /** Initial crop (uncontrolled). @default INITIAL_CROP */
  defaultValue?: Crop;
  /** Called with the next crop whenever the user pans, zooms, turns or resets the image. */
  onValueChange?: (crop: Crop) => void;
  /** Largest zoom, as a multiple of the scale that covers the frame. @default 4 */
  maxZoom?: number;
  /** Ignore every gesture and disable the controls. @default false */
  disabled?: boolean;
  children: ReactNode;
}

export function ImageCropperRoot({
  src,
  value,
  defaultValue = INITIAL_CROP,
  onValueChange,
  maxZoom = 4,
  disabled = false,
  children,
}: ImageCropperRootProps) {
  const [stored, setCrop] = useControllableState(value, defaultValue, onValueChange);
  const [size, setSize] = useState<Size>();
  const crop = useMemo(() => (size ? clampCrop(stored, size, maxZoom) : stored), [stored, size, maxZoom]);
  const area = useRef<HTMLDivElement | null>(null);
  const latest = useRef(crop);
  // eslint-disable-next-line react/refs -- This ref holds an imperative resource or the latest callback outside React state.
  latest.current = crop;

  const contextValue = useMemo<ImageCropperContextValue>(() => {
    const update = (next: (current: Crop, size: Size) => Crop) => {
      if (disabled || !size) {
        return;
      }
      latest.current = next(latest.current, size);
      setCrop(latest.current);
    };

    return {
      src,
      crop,
      size,
      minZoom: size ? minZoom(size) : 1,
      maxZoom,
      disabled,
      area,
      setSize,
      pan: (dx, dy) => update((c, s) => clampCrop({ ...c, x: c.x + dx, y: c.y + dy }, s, maxZoom)),
      zoomTo: zoom => update((c, s) => zoomCrop(c, zoom, s, maxZoom)),
      zoomBy: factor => update((c, s) => zoomCrop(c, c.zoom * factor, s, maxZoom)),
      rotate: () => update((c, s) => rotateCrop(c, s, maxZoom)),
      reset: () => update(() => INITIAL_CROP),
    };
  }, [src, crop, size, maxZoom, disabled, setCrop]);

  return <ImageCropperContext.Provider value={contextValue}>{children}</ImageCropperContext.Provider>;
}
