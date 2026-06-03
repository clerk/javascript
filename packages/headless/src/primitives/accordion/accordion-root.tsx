'use client';

import { Composite } from '@floating-ui/react';
import React, { type ReactNode, useCallback, useId, useMemo } from 'react';
import { useControllableState } from '../../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { AccordionContext, type AccordionContextValue } from './accordion-context';

export interface AccordionProps extends ComponentProps<'div'> {
  /** Controlled open items. */
  value?: string[];
  /** Initial open items (uncontrolled). */
  defaultValue?: string[];
  /** Called when open items change. */
  onValueChange?: (value: string[]) => void;
  /** When true, only one item can be open at a time. @default false */
  type?: 'single' | 'multiple';
  /** Disable all items. @default false */
  disabled?: boolean;
  children: ReactNode;
}

export function AccordionRoot(props: AccordionProps) {
  const { render, type = 'multiple', disabled = false, children, ...otherProps } = props;

  const [value, setValue] = useControllableState(props.value, props.defaultValue ?? [], props.onValueChange);

  const accordionId = useId();

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = value.includes(itemValue);
      if (isOpen) {
        setValue(value.filter(v => v !== itemValue));
      } else if (type === 'single') {
        setValue([itemValue]);
      } else {
        setValue([...value, itemValue]);
      }
    },
    [type, value, setValue],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({ value, toggle, disabled, accordionId }),
    [value, toggle, disabled, accordionId],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <Composite
        orientation='vertical'
        render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
          // aria-orientation is injected by Composite but is not valid on a
          // generic <div> (no widget role). Strip it to avoid an axe violation.
          const { 'aria-orientation': _ao, ...restCompositeProps } = compositeProps;

          const defaultProps: Record<string, unknown> = {
            'data-cl-slot': 'accordion-root',
            onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
              if (event.key !== 'Home' && event.key !== 'End') return;
              event.preventDefault();
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>('[data-cl-slot="accordion-trigger"]:not([disabled])'),
              );
              if (items.length === 0) return;
              const target = event.key === 'Home' ? items[0] : items[items.length - 1];
              target.focus();
            },
          };

          const merged = mergeProps<'div'>(
            defaultProps,
            mergeProps<'div'>(otherProps, restCompositeProps as Record<string, unknown>),
          );

          return renderElement({
            defaultTagName: 'div',
            render,
            props: merged,
          })!;
        }}
      >
        {children}
      </Composite>
    </AccordionContext.Provider>
  );
}
