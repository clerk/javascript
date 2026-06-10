'use client';

import { FloatingOverlay } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

export interface DialogViewportProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the dialog is open. Default: true */
  lockScroll?: boolean;
}

export const DialogViewport = React.forwardRef<HTMLDivElement, DialogViewportProps>(
  function DialogViewport(props, ref) {
    const { render, lockScroll = true, ...otherProps } = props;
    const { open, mounted, transitionProps } = useDialogContext();

    if (!mounted) {
      return null;
    }

    const state = { open };

    const defaultProps = {
      'data-cl-slot': 'dialog-viewport',
      ref,
      ...transitionProps,
    } satisfies DefaultProps<'div'>;

    return (
      <FloatingOverlay lockScroll={lockScroll}>
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
