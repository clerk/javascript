'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperRotateProps = ComponentProps<'button'>;

export const ImageCropperRotate = React.forwardRef<HTMLButtonElement, ImageCropperRotateProps>(
  function ImageCropperRotate(props, ref) {
    const { render, ...otherProps } = props;
    const { size, disabled, rotate } = useImageCropperContext();
    const inactive = disabled || size === undefined;

    const defaultProps = {
      type: 'button',
      disabled: inactive,
      onClick: () => rotate(),
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
  },
);
