'use client';

import { FloatingFocusManager, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Props for {@link DialogPopup}. */
export type DialogPopupProps = ComponentProps<'div'>;

/** The dialog content container. Manages focus trapping via `FloatingFocusManager` and wires ARIA attributes from `Dialog.Title` and `Dialog.Description`. */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(props, ref) {
  const { render, ...otherProps } = props;
  const { popupRef, refs, getFloatingProps, floatingContext, modal, labelId, descriptionId, mounted, transitionProps } =
    useDialogContext();

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([popupRef, refs.setFloating, ref]);

  if (!mounted) {
    return null;
  }

  const ownProps = {
    ref: combinedRef,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = { ...ownProps, ...getFloatingProps(), ...transitionProps };

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
      outsideElementsInert={modal}
    >
      {renderElement({
        defaultTagName: 'div',
        render,
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FloatingFocusManager>
  );
});
