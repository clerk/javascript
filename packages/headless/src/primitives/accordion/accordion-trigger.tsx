'use client';

import { CompositeItem } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';

export type AccordionTriggerProps = ComponentProps<'button'>;

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
            if (!disabled) {
              ctx.toggle(itemValue);
            }
          },
        };

        const merged = mergeProps<'button'>(
          mergeProps<'button'>(defaultProps, otherProps),
          compositeProps as Record<string, unknown>,
        );

        // The wired id is owned by the primitive: a consumer-supplied id must
        // not override it, or the trigger/panel aria pairing would silently break.
        merged.id = triggerId;

        // CompositeItem injects its roving-tabindex ref via compositeProps; hand it to
        // useRender's ref param (which owns ref-merging) instead of leaving it in props,
        // where useRender's merged ref would overwrite it and break focus navigation.
        const { ref: compositeRef, ...mergedProps } = merged;

        // floating-ui's CompositeItem invokes this render callback synchronously and
        // unconditionally during its own render (see renderJsx), so useRender runs in a
        // stable hook position on the CompositeItem fiber. The rule can't see that.
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useRender({
          defaultTagName: 'button',
          render,
          // SAFETY: mergeProps returns Record<string, unknown>; the ref CompositeItem
          // injected is a valid React ref at runtime.
          ref: compositeRef as React.Ref<unknown>,
          state,
          stateAttributesMapping: {
            open: (v: boolean): Record<string, string> | null =>
              v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' },
            disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
          },
          props: mergedProps,
        });
      }}
    >
      {children}
    </CompositeItem>
  );
}
