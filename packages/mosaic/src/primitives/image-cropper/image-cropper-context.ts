import { createContext, type RefObject, useContext } from 'react';

import type { Crop, Size } from './crop';

export interface ImageCropperContextValue {
  src: string;
  crop: Crop;
  size: Size | undefined;
  minZoom: number;
  maxZoom: number;
  disabled: boolean;
  area: RefObject<HTMLDivElement | null>;
  setSize: (size: Size) => void;
  pan: (dx: number, dy: number) => void;
  zoomTo: (zoom: number) => void;
  zoomBy: (factor: number) => void;
  rotate: () => void;
  reset: () => void;
}

export const ImageCropperContext = createContext<ImageCropperContextValue | null>(null);

export function useImageCropperContext(): ImageCropperContextValue {
  const context = useContext(ImageCropperContext);
  if (!context) {
    throw new Error('ImageCropper parts must be rendered inside <ImageCropper.Root>');
  }
  return context;
}
