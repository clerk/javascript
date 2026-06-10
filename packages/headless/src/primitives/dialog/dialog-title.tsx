'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

export type DialogTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(props, ref) {
  const { render, ...otherProps } = props;
  const { labelId } = useDialogContext();

  const defaultProps = {
    'data-cl-slot': 'dialog-title',
    id: labelId,
    ref,
  } satisfies DefaultProps<'h2'>;

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
});
