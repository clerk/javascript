'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useFileUploadContext } from './file-upload-context';

export type FileUploadTriggerProps = ComponentProps<'button'>;

export function FileUploadTrigger(props: FileUploadTriggerProps) {
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
    render,
    state,
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
