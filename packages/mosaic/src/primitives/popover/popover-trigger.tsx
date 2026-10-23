'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { usePopoverContext } from './popover-context';

export type PopoverTriggerProps = ComponentProps<'button'>;

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps } = usePopoverContext();

    const state = { open };

    const ownProps = {
      type: 'button',
    } satisfies DefaultProps<'button'>;

    const defaultProps = { ...ownProps, ...getReferenceProps() };

    return useRender({
      defaultTagName: 'button',
      render,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setReference` as a method, but it is a stable callback that does not use `this`.
      ref: [refs.setReference, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
