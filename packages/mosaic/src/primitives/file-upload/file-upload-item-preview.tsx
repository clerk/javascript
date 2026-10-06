'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useFileUploadItemContext } from './file-upload-context';
import { useObjectUrl } from './use-object-url';

export type FileUploadItemPreviewProps = ComponentProps<'img'>;

/**
 * Renders an `<img>` thumbnail for the item's file when it is an image. For
 * non-image files it renders nothing, so it is safe to drop in unconditionally.
 */
export const FileUploadItemPreview = React.forwardRef<HTMLImageElement, FileUploadItemPreviewProps>(
  function FileUploadItemPreview(props, ref) {
    const { render, ...otherProps } = props;
    const { file } = useFileUploadItemContext();

    const isImage = file.type.startsWith('image/');
    const objectUrl = useObjectUrl(isImage ? file : undefined);

    const defaultProps: Record<string, unknown> = {
      src: objectUrl,
      alt: file.name,
    };

    return useRender({
      defaultTagName: 'img',
      render,
      ref,
      // Only render once we are an image with a ready object URL, so we never
      // emit an <img> with an empty src.
      enabled: objectUrl != null,
      props: mergeProps<'img'>(defaultProps, otherProps),
    });
  },
);
