'use client';

import { useDialogContext } from './dialog-context';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';

export interface DialogCloseProps extends ComponentProps<'button'> {}

export function DialogClose(props: DialogCloseProps) {
  const { render, ...otherProps } = props;
  const { setOpen } = useDialogContext();

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'dialog-close',
    onClick() {
      setOpen(false);
    },
  };

  return renderElement({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
