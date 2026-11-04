'use client';

import React from 'react';

import { useCompositeItem } from '../hooks/use-composite';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';

export type AccordionTriggerProps = ComponentProps<'button'>;

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const ctx = useAccordionContext();
    const { itemValue, open, disabled, triggerId, panelId } = useAccordionItemContext();

    const compositeItem = useCompositeItem();

    const state = { open, disabled };

    const defaultProps = {
      type: 'button',
      disabled,
      'aria-expanded': open,
      'aria-controls': panelId,
      'aria-disabled': disabled || undefined,
      onClick: () => {
        if (!disabled) {
          ctx.toggle(itemValue);
        }
      },
    } satisfies DefaultProps<'button'>;

    const merged = mergeProps<'button'>(defaultProps, otherProps);

    // The wired id is owned by the primitive: a consumer-supplied id must
    // not override it, or the trigger/panel aria pairing would silently break.
    merged.id = triggerId;

    return useRender({
      defaultTagName: 'button',
      render,
      ref: [compositeItem, ref],
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: merged,
    });
  },
);
