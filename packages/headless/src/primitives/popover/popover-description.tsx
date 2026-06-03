'use client';

import { useId, useLayoutEffect } from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export interface PopoverDescriptionProps extends ComponentProps<'p'> {}

export function PopoverDescription(props: PopoverDescriptionProps) {
  const { render, ...otherProps } = props;
  const { setDescriptionId } = usePopoverContext();
  const id = useId();

  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  const defaultProps = {
    'data-cl-slot': 'popover-description',
    id,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}
