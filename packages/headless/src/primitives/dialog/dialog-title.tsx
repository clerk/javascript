'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogTitle}. */
export type DialogTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

/** Accessible dialog heading. Wires its `id` to `aria-labelledby` on `Dialog.Popup`. */
export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(props, ref) {
  const { render, ...otherProps } = props;
  const { labelId } = useDialogContext();

  const defaultProps = {
    id: labelId,
    ref,
  } satisfies DefaultProps<'h2'>;

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
});
