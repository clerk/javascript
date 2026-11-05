'use client';

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useDirection } from '../direction-provider';
import { CompositeItemsProvider, useComposite, useCompositeItems } from '../hooks/use-composite';
import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import {
  SegmentedControlContext,
  type SegmentedControlContextValue,
  type SegmentedControlDirection,
} from './segmented-control-context';

export interface SegmentedControlRootProps<T extends string = string> extends Omit<
  ComponentProps<'div'>,
  'defaultValue'
> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
}

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the value type parameter; the root only hands back values its caller passed in.
export const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  function SegmentedControlRoot(props, ref) {
    const { render, value: valueProp, defaultValue, onValueChange, disabled = false, children, ...otherProps } = props;

    const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onValueChange);
    const [direction, setDirection] = useState<SegmentedControlDirection>('forward');
    const readingDirection = useDirection();
    const [element, setElement] = useState<HTMLDivElement | null>(null);
    const selectedIndexRef = useRef(-1);

    const items = useCompositeItems();

    const select = useCallback(
      (nextValue: string) => {
        if (nextValue !== value) {
          setValue(nextValue);
        }
      },
      [value, setValue],
    );

    const composite = useComposite(element, {
      getItems: items.getItems,
      preferred: { key: value, getItem: () => items.getItem(value) },
      orientation: 'horizontal',
      loop: false,
      rtl: readingDirection === 'rtl',
      onNavigate: item => {
        const nextValue = items.getValue(item);
        if (nextValue !== undefined) {
          select(nextValue);
        }
      },
    });

    useLayoutEffect(() => {
      const index = items.getItems().findIndex(item => items.getValue(item) === value);
      const previousIndex = selectedIndexRef.current;
      selectedIndexRef.current = index;
      if (index !== -1 && previousIndex !== -1 && previousIndex !== index) {
        setDirection(index > previousIndex ? 'forward' : 'backward');
      }
    }, [value, items]);

    const contextValue = useMemo<SegmentedControlContextValue>(
      () => ({ value, select, disabled, direction }),
      [value, select, disabled, direction],
    );

    const state = { disabled };

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <CompositeItemsProvider value={items}>
          {useRender({
            defaultTagName: 'div',
            render,
            ref: [setElement, ref],
            state,
            stateAttributesMapping: {
              disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
            },
            props: mergeProps<'div'>(
              {
                role: 'radiogroup',
                'aria-orientation': 'horizontal',
                onKeyDown: composite.handleKeyDown,
                'aria-disabled': disabled || undefined,
                children,
              },
              otherProps,
            ),
          })}
        </CompositeItemsProvider>
      </SegmentedControlContext.Provider>
    );
  },
) as <T extends string = string>(
  props: SegmentedControlRootProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
