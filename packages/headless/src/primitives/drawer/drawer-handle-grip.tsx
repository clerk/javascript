'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { DrawerAttrs } from './css-vars';

/** Props for {@link DrawerHandleGrip}. */
export type DrawerHandleProps = ComponentProps<'div'>;

/**
 * The visual drag grip. Carries `data-drawer-handle`, which is also the
 * hit-test target when `Drawer.Root` has `handleOnly`. It is presentational by
 * default (no ARIA role) so it does not add a nameless control to the
 * accessibility tree — keyboard users dismiss via `Escape` / `Drawer.Close`.
 * Apply your own `role`/`aria-*` via props or `render` if you need it announced.
 */
export const DrawerHandleGrip = React.forwardRef<HTMLDivElement, DrawerHandleProps>(
  function DrawerHandleGrip(props, ref) {
    const { render, ...otherProps } = props;

    const defaultProps = {
      [DrawerAttrs.handle]: '',
    } satisfies DefaultProps<'div'>;

    return useRender({
      defaultTagName: 'div',
      render,
      ref,
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
