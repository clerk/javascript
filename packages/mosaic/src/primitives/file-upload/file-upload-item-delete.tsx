'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useFileUploadContext, useFileUploadItemContext } from './file-upload-context';

export type FileUploadItemDeleteProps = ComponentProps<'button'>;

export const FileUploadItemDelete = React.forwardRef<HTMLButtonElement, FileUploadItemDeleteProps>(
  function FileUploadItemDelete(props, ref) {
    const { render, ...otherProps } = props;
    const { disabled } = useFileUploadContext();
    const { remove } = useFileUploadItemContext();

    const state = { disabled };

    const defaultProps: Record<string, unknown> = {
      type: 'button' as const,
      disabled,
      onClick: () => {
        if (!disabled) {
          remove();
        }
      },
    };

    return useRender({
      defaultTagName: 'button',
      ref,
      render,
      state,
      stateAttributesMapping: {
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
