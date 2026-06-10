'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverTriggerProps = ComponentProps<'button'>;

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps } = usePopoverContext();

    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const combinedRef = useMergeRefs([refs.setReference, ref]);

    const state = { open };

    const defaultProps = {
      type: 'button' as const,
      'data-cl-slot': 'popover-trigger',
      ref: combinedRef,
      ...(getReferenceProps() as React.ComponentPropsWithRef<'button'>),
    };

    return renderElement({
      defaultTagName: 'button',
      render,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
