'use client';

import { useMemo } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { AccordionItemContext, type AccordionItemContextValue, useAccordionContext } from './accordion-context';

export interface AccordionItemProps extends ComponentProps<'div'> {
  /** Unique value identifying this item. */
  value: string;
  /** Disable this specific item. */
  disabled?: boolean;
}

export function AccordionItem(props: AccordionItemProps) {
  const { render, value: itemValue, disabled: itemDisabled, ...otherProps } = props;
  const ctx = useAccordionContext();

  const open = ctx.value.includes(itemValue);
  const disabled = itemDisabled ?? ctx.disabled;
  const triggerId = `${ctx.accordionId}-trigger-${itemValue}`;
  const panelId = `${ctx.accordionId}-panel-${itemValue}`;

  const itemContextValue = useMemo<AccordionItemContextValue>(
    () => ({ itemValue, open, disabled, triggerId, panelId }),
    [itemValue, open, disabled, triggerId, panelId],
  );

  const state = { open, disabled };

  const defaultProps = {};

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      {useRender({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
          disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </AccordionItemContext.Provider>
  );
}
