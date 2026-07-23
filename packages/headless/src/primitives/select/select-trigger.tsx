'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useSelectContext } from './select-context';

export type SelectTriggerProps = ComponentProps<'button'>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps } = useSelectContext();

    const state = { open };

    const ownProps = {
      type: 'button',
      'data-cl-slot': 'select-trigger',
    } satisfies DefaultProps<'button'>;

    const defaultProps = { ...ownProps, ...getReferenceProps() };

    return useRender({
      defaultTagName: 'button',
      render,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      // floating-ui types `setReference` as a method signature, but at runtime it's
      // a stable callback that doesn't use `this`, so the unbound-method check is a
      // false positive here.
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: [refs.setReference, ref],
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
