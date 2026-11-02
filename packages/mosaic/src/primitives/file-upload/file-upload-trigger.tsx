'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useFileUploadContext } from './file-upload-context';

export type FileUploadTriggerProps = ComponentProps<'button'>;

export const FileUploadTrigger = React.forwardRef<HTMLButtonElement, FileUploadTriggerProps>(
  function FileUploadTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { disabled, openFilePicker } = useFileUploadContext();

    const state = { disabled };

    const defaultProps: Record<string, unknown> = {
      type: 'button' as const,
      disabled,
      onClick: () => openFilePicker(),
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
