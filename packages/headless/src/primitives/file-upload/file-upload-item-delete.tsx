'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useFileUploadContext, useFileUploadItemContext } from './file-upload-context';

export type FileUploadItemDeleteProps = ComponentProps<'button'>;

export function FileUploadItemDelete(props: FileUploadItemDeleteProps) {
  const { render, ...otherProps } = props;
  const { disabled } = useFileUploadContext();
  const { remove } = useFileUploadItemContext();

  const state = { disabled };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'file-upload-item-delete',
    type: 'button' as const,
    disabled,
    onClick: () => {
      if (!disabled) {
        remove();
      }
    },
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
