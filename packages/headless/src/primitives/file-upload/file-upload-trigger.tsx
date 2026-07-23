'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFileUploadContext } from './file-upload-context';

export type FileUploadTriggerProps = ComponentProps<'button'>;

export function FileUploadTrigger(props: FileUploadTriggerProps) {
  const { render, ...otherProps } = props;
  const { disabled, openFilePicker } = useFileUploadContext();

  const state = { disabled };

  const defaultProps: Record<string, unknown> = {
    'data-cl-slot': 'file-upload-trigger',
    type: 'button' as const,
    disabled,
    onClick: () => openFilePicker(),
  };

  return useRender({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
