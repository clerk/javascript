'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { ZOOM_STEP } from './crop';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperZoomInProps = ComponentProps<'button'>;
export type ImageCropperZoomOutProps = ComponentProps<'button'>;

export const ImageCropperZoomIn = React.forwardRef<HTMLButtonElement, ImageCropperZoomInProps>(
  function ImageCropperZoomIn(props, ref) {
    const { crop, maxZoom } = useImageCropperContext();
    return useZoomStep(props, ref, ZOOM_STEP, crop.zoom >= maxZoom);
  },
);

export const ImageCropperZoomOut = React.forwardRef<HTMLButtonElement, ImageCropperZoomOutProps>(
  function ImageCropperZoomOut(props, ref) {
    const { crop } = useImageCropperContext();
    return useZoomStep(props, ref, 1 / ZOOM_STEP, crop.zoom <= 1);
  },
);

function useZoomStep(
  props: ComponentProps<'button'>,
  ref: React.ForwardedRef<HTMLButtonElement>,
  factor: number,
  atLimit: boolean,
) {
  const { render, ...otherProps } = props;
  const { size, disabled, zoomBy } = useImageCropperContext();
  const inactive = disabled || size === undefined || atLimit;

  const defaultProps = {
    type: 'button',
    disabled: inactive,
    onClick: () => zoomBy(factor),
  } satisfies DefaultProps<'button'>;

  return useRender({
    defaultTagName: 'button',
    ref,
    render,
    state: { disabled: inactive },
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
