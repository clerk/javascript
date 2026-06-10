'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

export type DialogCloseProps = ComponentProps<'button'>;

export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(props, ref) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDialogContext();

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-close',
    ref,
    onClick() {
      setOpen(false);
    },
  } satisfies DefaultProps<'button'>;

  return renderElement({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
