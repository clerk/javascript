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
    const { open, mounted, transitionProps } = useDialogContext();

    const state = { open };

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
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: mergeProps<'div'>(defaultProps, otherProps),
    });
  },
);
