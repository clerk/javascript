'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogClose}. */
export type DialogCloseProps = ComponentProps<'button'>;

/** Button that closes the dialog when clicked, forwarding the event so `finalFocus` sees the interaction type behind the close. */
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(props, ref) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDialogContext();

  const defaultProps = {
    type: 'button' as const,
    onClick(event: React.MouseEvent) {
      setOpen(false, event.nativeEvent);
    },
  } satisfies DefaultProps<'button'>;

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
