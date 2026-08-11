'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useDialogContext } from './dialog-context';
import { useDialogOrigin } from './use-dialog-origin';

/** Props for {@link DialogPopup}. */
export type DialogPopupProps = ComponentProps<'div'>;

/** The dialog content container. Manages focus trapping via `FloatingFocusManager` and wires ARIA attributes from `Dialog.Title` and `Dialog.Description`. */
export const DialogPopup = React.forwardRef<HTMLDivElement, DialogPopupProps>(function DialogPopup(props, ref) {
  const { render, ...otherProps } = props;
  const {
    open,
    popupRef,
    refs,
    getFloatingProps,
    floatingContext,
    modal,
    isNested,
    returnFocusRef,
    labelId,
    descriptionId,
    mounted,
    transitionProps,
  } = useDialogContext();

  // Measured here rather than on the root: `Dialog.Portal` renders through `FloatingPortal`,
  // which creates its container in a layout effect and renders nothing until it exists. A root
  // effect keyed on `open` would therefore run one commit before the popup is in the DOM and
  // never re-run. This component only renders once the portal is up, so its own layout effect
  // is the first moment the popup can be measured.
  useDialogOrigin(popupRef, floatingContext.elements.domReference, open);

  const ownProps = {
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
  } satisfies DefaultProps<'div'>;

  const defaultProps = {
    ...ownProps,
    ...(isNested ? { 'data-nested': '' } : {}),
    ...getFloatingProps(),
    ...transitionProps,
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
      returnFocus={returnFocusRef}
    >
      {element}
    </FloatingFocusManager>
  );
});
