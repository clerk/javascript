'use client';

import { useId, useLayoutEffect } from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export interface PopoverTitleProps extends ComponentProps<'h2'> {}

export function PopoverTitle(props: PopoverTitleProps) {
  const { render, ...otherProps } = props;
  const { setLabelId } = usePopoverContext();
  const id = useId();

  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  const defaultProps = {
    'data-cl-slot': 'popover-title',
    id,
  };

  return renderElement({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}
