'use client';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { usePopoverContext } from './popover-context';

export type PopoverCloseProps = ComponentProps<'button'>;

export function PopoverClose(props: PopoverCloseProps) {
  const { render, ...otherProps } = props;
  const { setOpen } = usePopoverContext();

  const defaultProps = {
    type: 'button' as const,
    'data-cl-slot': 'popover-close',
    onClick() {
      setOpen(false);
    },
  };

  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
