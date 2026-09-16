'use client';

import { useEffect } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { usePopoverContext } from './popover-context';

export type PopoverTitleProps = Omit<ComponentProps<'h2'>, 'id'>;

export function PopoverTitle(props: PopoverTitleProps) {
  const { render, ...otherProps } = props;
  const { labelId, setHasTitle } = usePopoverContext();

  useEffect(() => {
    setHasTitle(true);
    return () => setHasTitle(false);
  }, [setHasTitle]);

  const defaultProps = {
    id: labelId,
  };

  return useRender({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(defaultProps, otherProps),
  });
}
