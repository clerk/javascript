'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export type SelectTriggerProps = ComponentProps<'button'>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps } = useSelectContext();

    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const combinedRef = useMergeRefs([refs.setReference, ref]);

    const state = { open };

    const ownProps = {
      type: 'button',
      'data-cl-slot': 'select-trigger',
      ref: combinedRef,
    } satisfies DefaultProps<'button'>;

    const defaultProps = { ...ownProps, ...getReferenceProps() };

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
