'use client';

import { Composite } from '@floating-ui/react';
import React, { useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';

import { type ComponentProps, isRef, mergeProps, useRender } from '../utils';
import {
  SegmentedControlContext,
  type SegmentedControlContextValue,
  type SegmentedControlDirection,
} from './segmented-control-context';

const NAVIGATION_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']);

interface SelectionState {
  value: string;
  direction: SegmentedControlDirection;
}

interface SelectAction {
  value: string;
  fromIndex: number;
  toIndex: number;
}

function selectionReducer(state: SelectionState, action: SelectAction): SelectionState {
  if (action.value === state.value) {
    return state;
  }
  const { fromIndex, toIndex } = action;
  const moved = fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex;
  return {
    value: action.value,
    direction: moved ? (toIndex > fromIndex ? 'forward' : 'backward') : state.direction,
  };
}

export interface SegmentedControlRootProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  function SegmentedControlRoot(props, ref) {
    const { render, value: valueProp, defaultValue, onValueChange, disabled = false, children, ...otherProps } = props;

    const [selection, dispatch] = useReducer(selectionReducer, {
      value: valueProp ?? defaultValue ?? '',
      direction: 'forward',
    });
    const [activeIndex, setActiveIndex] = useState(0);
    const [rtl, setRtl] = useState(false);
    const navigatingRef = useRef(false);
    const isNavigating = useCallback(() => navigatingRef.current, []);
    const itemsRef = useRef(new Map<string, HTMLElement>());

    const registerItem = useCallback((itemValue: string, element: HTMLElement | null) => {
      if (element) {
        itemsRef.current.set(itemValue, element);
      } else {
        itemsRef.current.delete(itemValue);
      }
    }, []);

    const getIndex = useCallback((itemValue: string) => {
      const element = itemsRef.current.get(itemValue);
      if (!element) {
        return -1;
      }
      return Array.from(itemsRef.current.values()).filter(
        other => other.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).length;
    }, []);

    const update = useCallback(
      (fromValue: string, toValue: string) => {
        dispatch({ value: toValue, fromIndex: getIndex(fromValue), toIndex: getIndex(toValue) });
      },
      [getIndex],
    );

    if (valueProp !== undefined && valueProp !== selection.value) {
      update(selection.value, valueProp);
    }

    const value = valueProp ?? selection.value;
    const { direction } = selection;
    const isControlled = valueProp !== undefined;

    const select = useCallback(
      (nextValue: string) => {
        if (nextValue === value) {
          return;
        }
        if (!isControlled) {
          update(value, nextValue);
        }
        onValueChange?.(nextValue);
      },
      [value, isControlled, update, onValueChange],
    );

    useLayoutEffect(() => {
      const selectedIndex = getIndex(value);
      if (selectedIndex !== -1) {
        setActiveIndex(selectedIndex);
      }
    }, [getIndex, value]);

    const contextValue = useMemo<SegmentedControlContextValue>(
      () => ({ value, select, isNavigating, registerItem, disabled, direction }),
      [value, select, isNavigating, registerItem, disabled, direction],
    );

    const state = { disabled };

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <Composite
          orientation='horizontal'
          loop={false}
          rtl={rtl}
          activeIndex={activeIndex}
          onNavigate={setActiveIndex}
          render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
            const defaultProps: Record<string, unknown> = {
              role: 'radiogroup' as const,
              onFocus: (event: React.FocusEvent<HTMLElement>) => {
                setRtl((event.currentTarget.closest('[dir]')?.getAttribute('dir') ?? '').toLowerCase() === 'rtl');
              },
              onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
                if (NAVIGATION_KEYS.has(event.key)) {
                  navigatingRef.current = true;
                  queueMicrotask(() => {
                    navigatingRef.current = false;
                  });
                }
              },
              'aria-disabled': disabled || undefined,
            };

            const merged = mergeProps<'div'>(defaultProps, mergeProps<'div'>(otherProps, compositeProps));
            const { ref: compositeRef, ...mergedProps } = merged;

            // eslint-disable-next-line react-hooks/rules-of-hooks -- floating-ui's Composite calls this render callback synchronously during its own render, so the hook keeps a stable position.
            return useRender({
              defaultTagName: 'div',
              render,
              ref: [isRef(compositeRef) ? compositeRef : undefined, ref],
              state,
              stateAttributesMapping: {
                disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
              },
              props: mergedProps,
            });
          }}
        >
          {children}
        </Composite>
      </SegmentedControlContext.Provider>
    );
  },
);
