'use client';

import React, { type ReactNode, useCallback, useId, useMemo, useState } from 'react';

import { CompositeItemsProvider, useComposite, useCompositeItems } from '../hooks/use-composite';
import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, useRender } from '../utils';
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

export const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionProps>(function AccordionRoot(props, ref) {
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

  const [element, setElement] = useState<HTMLDivElement | null>(null);

  const items = useCompositeItems();
  const composite = useComposite(element, {
    getItems: items.getItems,
    orientation: 'vertical',
  });

  return (
    <AccordionContext.Provider value={contextValue}>
      <CompositeItemsProvider value={items}>
        {useRender({
          defaultTagName: 'div',
          render,
          ref: [setElement, ref],
          props: mergeProps<'div'>({ onKeyDown: composite.handleKeyDown, children }, otherProps),
        })}
      </CompositeItemsProvider>
    </AccordionContext.Provider>
  );
});
