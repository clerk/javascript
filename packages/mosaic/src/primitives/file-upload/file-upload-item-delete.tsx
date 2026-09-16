'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFileUploadContext, useFileUploadItemContext } from './file-upload-context';

export type FileUploadItemDeleteProps = ComponentProps<'button'>;

export function FileUploadItemDelete(props: FileUploadItemDeleteProps) {
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
    render,
    state,
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
