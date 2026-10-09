'use client';

import { Composite } from '@floating-ui/react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../hooks/use-controllable-state';
import { type ComponentProps, isRef, mergeProps, useRender } from '../utils';
import {
  SegmentedControlContext,
  type SegmentedControlContextValue,
  type SegmentedControlDirection,
} from './segmented-control-context';

export interface SegmentedControlRootProps extends Omit<ComponentProps<'div'>, 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const SegmentedControlRoot = React.forwardRef<HTMLDivElement, SegmentedControlRootProps>(
  function SegmentedControlRoot(props, ref) {
    const { render, value: valueProp, defaultValue, onValueChange, disabled = false, children, ...otherProps } = props;

    const [value, setValue] = useControllableState(valueProp, defaultValue ?? '', onValueChange);
    const [direction, setDirection] = useState<SegmentedControlDirection>('forward');
    const [activeIndex, setActiveIndex] = useState(0);
    const [rtl, setRtl] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const selectedIndexRef = useRef(-1);
    const navigatedIndexRef = useRef<number | null>(null);

    const getRadios = () => Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []);

    const select = useCallback(
      (nextValue: string) => {
        if (nextValue !== value) {
          setValue(nextValue);
        }
      },
      [value, setValue],
    );

    useLayoutEffect(() => {
      const index = getRadios().findIndex(radio => radio.getAttribute('value') === value);
      const previousIndex = selectedIndexRef.current;
      selectedIndexRef.current = index;
      if (index === -1) {
        return;
      }
      if (previousIndex !== -1 && previousIndex !== index) {
        setDirection(index > previousIndex ? 'forward' : 'backward');
      }
      setActiveIndex(index);
    }, [value]);

    const onNavigate = (index: number) => {
      setActiveIndex(index);
      if (navigatedIndexRef.current !== null) {
        navigatedIndexRef.current = index;
      }
    };

    const contextValue = useMemo<SegmentedControlContextValue>(
      () => ({ value, select, disabled, direction }),
      [value, select, disabled, direction],
    );

    const state = { disabled };

    return (
      <SegmentedControlContext.Provider value={contextValue}>
        <Composite
          orientation='horizontal'
          loop={false}
          rtl={rtl}
          activeIndex={activeIndex}
          onNavigate={onNavigate}
          render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
            const { onKeyDown: compositeKeyDown, ...otherCompositeProps } = compositeProps;
            const defaultProps: Record<string, unknown> = {
              role: 'radiogroup' as const,
              onFocus: (event: React.FocusEvent<HTMLElement>) => {
                setRtl((event.currentTarget.closest('[dir]')?.getAttribute('dir') ?? '').toLowerCase() === 'rtl');
              },
              onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
                navigatedIndexRef.current = -1;
                if (event.key === 'Home' || event.key === 'End') {
                  event.preventDefault();
                  const enabled = getRadios().filter(radio => radio.getAttribute('aria-disabled') !== 'true');
                  (event.key === 'Home' ? enabled[0] : enabled.at(-1))?.focus();
                }
                compositeKeyDown?.(event);
                const index = navigatedIndexRef.current;
                navigatedIndexRef.current = null;
                const nextValue = getRadios()[index]?.getAttribute('value');
                if (nextValue != null) {
                  select(nextValue);
                }
              },
              'aria-disabled': disabled || undefined,
            };

            const merged = mergeProps<'div'>(defaultProps, mergeProps<'div'>(otherProps, otherCompositeProps));
            const { ref: compositeRef, ...mergedProps } = merged;

            // eslint-disable-next-line react-hooks/rules-of-hooks -- floating-ui's Composite calls this render callback synchronously during its own render, so the hook keeps a stable position.
            return useRender({
              defaultTagName: 'div',
              render,
              ref: [isRef(compositeRef) ? compositeRef : undefined, rootRef, ref],
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
