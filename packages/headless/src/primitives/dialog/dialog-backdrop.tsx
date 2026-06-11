'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogBackdrop}. */
export type DialogBackdropProps = ComponentProps<'div'>;

/** Semi-transparent overlay surface rendered behind the dialog. Does not own scroll-lock or positioning — use `Dialog.Viewport` for those. */
export const DialogBackdrop = React.forwardRef<HTMLDivElement, DialogBackdropProps>(
  function DialogBackdrop(props, ref) {
    const { render, ...otherProps } = props;
    const { open, mounted, transitionProps } = useDialogContext();

    if (!mounted) {
      return null;
    }

    const state = { open };

    const defaultProps = {
      'data-cl-slot': 'dialog-backdrop',
      ref,
      ...transitionProps,
    } satisfies DefaultProps<'div'>;

    return renderElement({
      defaultTagName: 'div',
      render,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
