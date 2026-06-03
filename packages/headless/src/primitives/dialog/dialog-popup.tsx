'use client';

import { FloatingFocusManager, useMergeRefs } from '@floating-ui/react';
import { useDialogContext } from './dialog-context';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface DialogPopupProps extends ComponentProps<'div'> {}

export function DialogPopup(props: DialogPopupProps) {
  const { render, ...otherProps } = props;
  const { popupRef, refs, getFloatingProps, floatingContext, modal, labelId, descriptionId, mounted, transitionProps } =
    useDialogContext();

  const combinedRef = useMergeRefs([popupRef, refs.setFloating]);

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
