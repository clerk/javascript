'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { type Crop, type Size, turned } from './crop';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperImageProps = ComponentProps<'img'>;

export const ImageCropperImage = React.forwardRef<HTMLImageElement, ImageCropperImageProps>(
  function ImageCropperImage(props, ref) {
    const { render, ...otherProps } = props;
    const { src, crop, size, setSize } = useImageCropperContext();

    const defaultProps = {
      src,
      alt: '',
      draggable: false,
      style: size ? placement(crop, size) : { visibility: 'hidden' },
      onLoad: event => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        setSize({ width: naturalWidth, height: naturalHeight });
      },
    } satisfies DefaultProps<'img'>;

    return useRender({
      defaultTagName: 'img',
      ref,
      render,
      state: { loaded: size !== undefined },
      stateAttributesMapping: {
        loaded: (v: boolean) => (v ? { 'data-loaded': '' } : null),
      },
      props: mergeProps<'img'>(defaultProps, otherProps),
    });
  },
);

function placement(crop: Crop, size: Size): React.CSSProperties {
  const { width, height } = turned(size, crop.rotation);
  const short = Math.min(width, height);
  return {
    position: 'absolute',
    left: percent(0.5 + crop.x),
    top: percent(0.5 + crop.y),
    width: percent((size.width / short) * crop.zoom),
    height: percent((size.height / short) * crop.zoom),
    maxWidth: 'none',
    transform: `translate(-50%, -50%) rotate(${crop.rotation}deg)`,
  };
}

function percent(fraction: number): string {
  return `${fraction * 100}%`;
}
