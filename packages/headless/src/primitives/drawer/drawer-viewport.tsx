'use client';

import { FloatingOverlay } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDrawerContext } from './drawer-context';

/** Props for {@link DrawerViewport}. */
export interface DrawerViewportProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the drawer is open. Default: true */
  lockScroll?: boolean;
}

/**
 * Fixed full-viewport container for the drawer. Wraps `FloatingOverlay` for
 * scroll-locking; the sheet (`Drawer.Popup`) is positioned against the bottom
 * edge by the styled layer. Scroll-lock lives here, not on `Drawer.Backdrop`,
 * so the backdrop surface can be styled independently.
 */
export const DrawerViewport = React.forwardRef<HTMLDivElement, DrawerViewportProps>(
  function DrawerViewport(props, ref) {
    const { render, lockScroll = true, ...otherProps } = props;
    const { open, mounted, transitionProps, modal } = useDrawerContext();

    if (!mounted) {
      return null;
    }

    const state = { open };

    const defaultProps = {
      ref,
      ...transitionProps,
      style: modal ? undefined : { pointerEvents: 'auto' as const },
    } satisfies DefaultProps<'div'>;

    return (
      <FloatingOverlay
        lockScroll={lockScroll}
        style={modal ? undefined : { pointerEvents: 'none' }}
      >
        {renderElement({
          defaultTagName: 'div',
          render,
          state,
          stateAttributesMapping: {
            open: (v: boolean): Record<string, string> | null =>
              v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' },
          },
          props: mergeProps<'div'>(defaultProps, otherProps),
        })}
      </FloatingOverlay>
    );
  },
);
