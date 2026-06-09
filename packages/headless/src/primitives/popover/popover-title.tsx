'use client';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

export function PopoverTitle(props: PopoverTitleProps) {
  const { render, ...otherProps } = props;
  const { labelId } = usePopoverContext();

  const defaultProps = {
    'data-cl-slot': 'popover-title',
    id: labelId,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}
