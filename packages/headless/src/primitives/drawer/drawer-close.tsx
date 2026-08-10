'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerClose}. */
export type DrawerCloseProps = ComponentProps<'button'>;

/** Button that closes the drawer when clicked. Calls `setOpen(false)` from drawer context. */
export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose(props, ref) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDrawerContext();

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
