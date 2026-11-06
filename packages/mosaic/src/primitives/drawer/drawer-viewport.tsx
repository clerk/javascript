'use client';

import { FloatingOverlay } from '@floating-ui/react';
import React from 'react';

import { useScrollLock } from '../hooks/use-scroll-lock';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerViewport}. */
export interface DrawerViewportProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the drawer is open. Default: true */
  lockScroll?: boolean;
}

/**
 * Fixed full-viewport container for the drawer. Locks page scroll and wraps
 * `FloatingOverlay`; the sheet (`Drawer.Popup`) is positioned against the bottom
 * edge by the styled layer. Scroll-lock lives here, not on `Drawer.Backdrop`,
 * so the backdrop surface can be styled independently.
 */
export const DrawerViewport = React.forwardRef<HTMLDivElement, DrawerViewportProps>(
  function DrawerViewport(props, ref) {
    const { render, lockScroll = true, ...otherProps } = props;
    const { open, mounted, transitionProps, modal } = useDrawerContext();
    useScrollLock(mounted && lockScroll);

    const state = { open };

    const defaultProps = {
      ...transitionProps,
      style: modal ? undefined : { pointerEvents: 'auto' as const },
    } satisfies DefaultProps<'div'>;

    const element = useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });

    if (!element) {
      return null;
    }

    return <FloatingOverlay style={modal ? undefined : { pointerEvents: 'none' }}>{element}</FloatingOverlay>;
  },
);
