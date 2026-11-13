'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperZoomProps = ComponentProps<'input'>;

export const ImageCropperZoom = React.forwardRef<HTMLInputElement, ImageCropperZoomProps>(
  function ImageCropperZoom(props, ref) {
    const { render, ...otherProps } = props;
    const { crop, size, minZoom, maxZoom, disabled, zoomTo } = useImageCropperContext();
    const inactive = disabled || size === undefined;

    const defaultProps = {
      type: 'range',
      min: minZoom,
      max: maxZoom,
      step: 0.01,
      value: crop.zoom,
      disabled: inactive,
      onChange: event => zoomTo(Number(event.currentTarget.value)),
    } satisfies DefaultProps<'input'>;

    return useRender({
      defaultTagName: 'input',
      ref,
      render,
      state: { disabled: inactive },
      stateAttributesMapping: {
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'input'>(defaultProps, otherProps),
    });
  },
);
