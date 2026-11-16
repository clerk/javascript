'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useImageCropperContext } from './image-cropper-context';

export type ImageCropperAreaProps = ComponentProps<'div'>;

export const ImageCropperArea = React.forwardRef<HTMLDivElement, ImageCropperAreaProps>(
  function ImageCropperArea(props, ref) {
    const { render, ...otherProps } = props;
    const { area } = useImageCropperContext();

    return useRender({
      defaultTagName: 'div',
      ref: [area, ref],
      render,
      props: mergeProps<'div'>({}, otherProps),
    });
  },
);
