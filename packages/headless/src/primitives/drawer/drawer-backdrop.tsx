'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { DrawerAttrs } from './css-vars';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerBackdrop}. */
export type DrawerBackdropProps = ComponentProps<'div'>;

/** Semi-transparent overlay behind the drawer. Styling reads `--cl-drawer-swipe-progress` to fade during a drag; this part only emits state attributes. */
export const DrawerBackdrop = React.forwardRef<HTMLDivElement, DrawerBackdropProps>(
  function DrawerBackdrop(props, ref) {
    const { render, ...otherProps } = props;
    const { open, mounted, transitionProps, backdropRef, drag } = useDrawerContext();

    const state = { open, swiping: drag.isDragging };

    const defaultProps = {
      ...transitionProps,
    } satisfies DefaultProps<'div'>;

    return useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref: [backdropRef, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
        swiping: (v: boolean): Record<string, string> | null => (v ? { [DrawerAttrs.swiping]: '' } : null),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
