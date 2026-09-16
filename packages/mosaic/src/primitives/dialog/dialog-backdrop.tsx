'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogBackdrop}. */
export type DialogBackdropProps = ComponentProps<'div'>;

/** Semi-transparent overlay surface rendered behind the dialog. Does not own scroll-lock or positioning — use `Dialog.Viewport` for those. */
export const DialogBackdrop = React.forwardRef<HTMLDivElement, DialogBackdropProps>(
  function DialogBackdrop(props, ref) {
    const { render, ...otherProps } = props;
    const { open, mounted, isNested, isStacked, transitionProps } = useDialogContext();

    // No `stacked` counterpart to `data-stack-base` here: what a dialog beneath the stack does is
    // recede, and that is the popup's business. The backdrop only needs to know to get out of the
    // way when it is not the one scrim the stack shows.
    const state = { open, nested: isNested, stacked: isStacked };

    const defaultProps = {
      ...transitionProps,
    } satisfies DefaultProps<'div'>;

    return useRender({
      defaultTagName: 'div',
      render,
      enabled: mounted,
      ref,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
        nested: (v: boolean): Record<string, string> | null => (v ? { 'data-nested': '' } : null),
        stacked: (v: boolean): Record<string, string> | null => (v ? { 'data-stacked': '' } : null),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
