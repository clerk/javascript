'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogPopup}. */
export type DialogPopupProps = ComponentProps<'div'>;

/** The dialog content container. Manages focus trapping via `FloatingFocusManager` and wires ARIA attributes from `Dialog.Title` and `Dialog.Description`. */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, refs, getFloatingProps, floatingContext, modal, labelId, descriptionId, mounted, transitionProps } =
    useDialogContext();

  const ownProps = {
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = { ...ownProps, ...getFloatingProps(), ...transitionProps };

  const element = useRender({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    // floating-ui types `setFloating` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: [popupRef, refs.setFloating, ref],
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  if (!element) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
      outsideElementsInert={modal}
    >
      {element}
    </FloatingFocusManager>
  );
});
