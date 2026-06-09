'use client';

import { FloatingFocusManager, useMergeRefs } from '@floating-ui/react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useDialogContext } from './dialog-context';

export type DialogPopupProps = ComponentProps<'div'>;

export function DialogPopup(props: DialogPopupProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { popupRef, refs, getFloatingProps, floatingContext, modal, labelId, descriptionId, mounted, transitionProps } =
    useDialogContext();

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([popupRef, refs.setFloating, consumerRef]);

  if (!mounted) {
    return null;
  }

  const defaultProps = {
    'data-cl-slot': 'dialog-popup',
    ref: combinedRef,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
    ...transitionProps,
  };

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
    >
      {renderElement({
        defaultTagName: 'div',
        render,
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </FloatingFocusManager>
  );
}
