'use client';

import React, { useEffect, useState } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFileUploadItemContext } from './file-upload-context';

export type FileUploadItemPreviewProps = ComponentProps<'img'>;

/**
 * Renders an `<img>` thumbnail for the item's file when it is an image. For
 * non-image files it renders nothing, so it is safe to drop in unconditionally.
 * The object URL is created on mount and revoked on unmount to avoid leaks.
 */
export const FileUploadItemPreview = React.forwardRef<HTMLImageElement, FileUploadItemPreviewProps>(
  function FileUploadItemPreview(props, ref) {
    const { render, ...otherProps } = props;
    const { file } = useFileUploadItemContext();

    const isImage = file.type.startsWith('image/');
    const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
      if (!isImage) {
        return;
      }
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(undefined);
      };
    }, [file, isImage]);

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
      enabled: isImage && objectUrl != null,
      props: mergeProps<'img'>(defaultProps, otherProps),
    });
  },
);
