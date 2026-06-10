'use client';

import { FloatingOverlay } from '@floating-ui/react';
import { useContext } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { DialogScopedContext, useDialogContext } from './dialog-context';

export interface DialogBackdropProps extends ComponentProps<'div'> {
  /** When true, locks body scroll while the dialog is open. Default: true */
  lockScroll?: boolean;
}

export function DialogBackdrop(props: DialogBackdropProps) {
  const { render, lockScroll = true, ...otherProps } = props;
  const { open, mounted, transitionProps } = useDialogContext();
  const scoped = useContext(DialogScopedContext);

  const state = { open };

  const defaultProps = {
    'data-cl-slot': 'dialog-backdrop',
    ...transitionProps,
  } as React.ComponentPropsWithRef<'div'>;

  const backdropElement = renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  if (scoped) {
    return backdropElement;
  }

  if (!mounted) {
    return null;
  }

  return <FloatingOverlay lockScroll={lockScroll}>{backdropElement}</FloatingOverlay>;
}
