'use client';

import { CompositeItem } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';

export interface AccordionTriggerProps extends ComponentProps<'button'> {}

export function AccordionTrigger(props: AccordionTriggerProps) {
  const { render, children, ...otherProps } = props;
  const ctx = useAccordionContext();
  const { itemValue, open, disabled, triggerId, panelId } = useAccordionItemContext();

  const state = { open, disabled };

  return (
    <CompositeItem
      disabled={disabled}
      render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
        const defaultProps: Record<string, unknown> = {
          'data-cl-slot': 'accordion-trigger',
          id: triggerId,
          type: 'button' as const,
          'aria-expanded': open,
          'aria-controls': panelId,
          'aria-disabled': disabled || undefined,
          onClick: () => {
            if (!disabled) ctx.toggle(itemValue);
          },
        };

        const merged = mergeProps<'button'>(
          mergeProps<'button'>(defaultProps, otherProps),
          compositeProps as Record<string, unknown>,
        );

        return renderElement({
          defaultTagName: 'button',
          render,
          state,
          stateAttributesMapping: {
            open: (v: boolean): Record<string, string> | null =>
              v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' },
            disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          },
          props: merged,
        })!;
      }}
    >
      {children}
    </CompositeItem>
  );
}
