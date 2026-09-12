'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type FocusTarget, useFinalFocus, useInitialFocus } from '../../hooks/use-focus-target';
import { type ComponentProps, type DefaultProps, Freeze, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';

/** Where a popup's focus goes on open (`initialFocus`) or close (`finalFocus`); see `useFocusTarget`. */
export type DialogFocusTarget = FocusTarget;

/** Props for {@link DialogPopup}. */
export interface DialogPopupProps extends ComponentProps<'div'> {
  /** Where focus moves when the dialog opens. Default: the first tabbable element inside it. */
  initialFocus?: DialogFocusTarget;
  /** Where focus returns when the dialog closes. Default: the trigger, via `useReturnFocus`. */
  finalFocus?: DialogFocusTarget;
}

/** The dialog content container. Manages focus trapping via `FloatingFocusManager` and wires ARIA attributes from `Dialog.Title` and `Dialog.Description`. */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(props, ref) {
  const { render, initialFocus, finalFocus, children, ...otherProps } = props;
  const {
    open,
    popupRef,
    refs,
    getFloatingProps,
    floatingContext,
    modal,
    isNested,
    isStacked,
    stackedChildCount,
    returnFocusRef,
    labelId,
    descriptionId,
    mounted,
    transitionProps,
  } = useDialogContext();

  const resolvedInitialFocus = useInitialFocus(initialFocus, open, floatingContext);
  const resolvedReturnFocus = useFinalFocus(finalFocus, returnFocusRef, floatingContext);

  const ownProps = {
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = {
    ...ownProps,
    ...(isNested ? { 'data-nested': '' } : {}),
    // Both can be set at once, and that is the ordinary case rather than an edge: in a
    // panel -> prompt -> alert stack the middle dialog is stacked on one surface while another
    // is stacked on it.
    ...(isStacked ? { 'data-stacked': '' } : {}),
    ...(stackedChildCount > 0 ? { 'data-stack-base': '' } : {}),
    ...getFloatingProps(),
    ...transitionProps,
    // The popup outlives `open` by the length of its exit animation, and whatever closed it has
    // usually reset the state behind it — a machine returning to `idle`, a form clearing. The
    // contents hold their last frame on the way out instead of snapping back under the fade. The
    // popup element itself stays live, so `data-closed` / `data-ending-style` still land.
    children: <Freeze frozen={!open}>{children}</Freeze>,
  };

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
      initialFocus={resolvedInitialFocus}
      returnFocus={resolvedReturnFocus}
    >
      {element}
    </FloatingFocusManager>
  );
});
