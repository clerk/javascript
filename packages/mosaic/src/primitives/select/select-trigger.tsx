'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useSelectContext } from './select-context';

export type SelectTriggerProps = ComponentProps<'button'>;

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, refs, getReferenceProps, openMethodRef } = useSelectContext();

    const state = { open };

    const ownProps = {
      type: 'button',
    } satisfies DefaultProps<'button'>;

    const defaultProps = {
      ...ownProps,
      ...getReferenceProps({
        onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
          openMethodRef.current = event.pointerType;
        },
        onKeyDown() {
          openMethodRef.current = 'keyboard';
        },
      }),
    };

    return useRender({
      defaultTagName: 'button',
      render,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
      },
      // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setReference` as a method, but it is a stable callback that does not use `this`.
      ref: [refs.setReference, ref],
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
