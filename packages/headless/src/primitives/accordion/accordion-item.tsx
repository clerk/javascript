'use client';

import { useMemo } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
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

  const defaultProps = {
    'data-cl-slot': 'accordion-item',
  };

  return (
    <AccordionItemContext.Provider value={itemContextValue}>
      {renderElement({
        defaultTagName: 'div',
        render,
        state,
        stateAttributesMapping: {
          open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
          disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
        },
        props: mergeProps<'div'>(defaultProps, otherProps),
      })}
    </AccordionItemContext.Provider>
  );
}
