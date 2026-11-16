'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperResetProps = ComponentProps<'button'>;

export const ImageCropperReset = React.forwardRef<HTMLButtonElement, ImageCropperResetProps>(
  function ImageCropperReset(props, ref) {
    const { render, ...otherProps } = props;
    const { size, disabled, reset } = useImageCropperContext();
    const inactive = disabled || size === undefined;

    const defaultProps = {
      type: 'button',
      disabled: inactive,
      onClick: () => reset(),
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
