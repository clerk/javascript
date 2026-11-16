'use client';

import React, { useEffect } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { usePopoverContext } from './popover-context';

export type PopoverDescriptionProps = Omit<ComponentProps<'p'>, 'id'>;

export const PopoverDescription = React.forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  function PopoverDescription(props, ref) {
    const { render, ...otherProps } = props;
    const { descriptionId, setHasDescription } = usePopoverContext();

    useEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    const defaultProps = {
      id: descriptionId,
    };

    return useRender({
      defaultTagName: 'p',
      ref,
      render,
      props: mergeProps<'p'>(defaultProps, otherProps),
    });
  },
);
