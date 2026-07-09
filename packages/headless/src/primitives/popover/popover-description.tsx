'use client';

import { useEffect } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

export function PopoverDescription(props: PopoverDescriptionProps) {
  const { render, ...otherProps } = props;
  const { descriptionId, setHasDescription } = usePopoverContext();

  useEffect(() => {
    setHasDescription(true);
    return () => setHasDescription(false);
  }, [setHasDescription]);

  const defaultProps = {
    'data-cl-slot': 'popover-description',
    id: descriptionId,
  };

  return renderElement({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(defaultProps, otherProps),
  });
}
