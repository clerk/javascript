'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogClose}. */
export type DialogCloseProps = ComponentProps<'button'>;

/** Button that closes the dialog when clicked. Calls `setOpen(false)` from dialog context. */
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(props, ref) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDialogContext();

  const defaultProps = {
    type: 'button' as const,
    onClick() {
      setOpen(false);
    },
  } satisfies DefaultProps<'button'>;

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
