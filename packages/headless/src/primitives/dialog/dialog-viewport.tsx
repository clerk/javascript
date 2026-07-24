'use client';

import { FloatingOverlay } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogViewport}. */
export interface DialogViewportProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the dialog is open. Default: true */
  lockScroll?: boolean;
}

/**
 * Fixed centering container for dialog content. Wraps `FloatingOverlay` to
 * provide scroll-locking and full-viewport positioning. Nest `Dialog.Popup`
 * inside this component for standard modal behavior.
 *
 * Scroll-lock responsibility lives here, not on `Dialog.Backdrop`, so the
 * backdrop surface can be styled independently.
 */
export const DialogViewport = React.forwardRef<HTMLDivElement, DialogViewportProps>(
  function DialogViewport(props, ref) {
    const { render, lockScroll = true, ...otherProps } = props;
    const { open, mounted, transitionProps, modal } = useDialogContext();

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

    return (
      <FloatingOverlay
        lockScroll={lockScroll}
        style={modal ? undefined : { pointerEvents: 'none' }}
      >
        {element}
      </FloatingOverlay>
    );
  },
);
