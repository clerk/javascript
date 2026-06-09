'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useDialogContext } from './dialog-context';

export type DialogCloseProps = ComponentProps<'button'>;

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
