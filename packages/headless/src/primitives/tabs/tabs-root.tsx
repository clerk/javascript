'use client';

import { type ReactNode, useCallback, useId, useMemo, useRef, useState } from 'react';

import { useControllableState } from '../../hooks/use-controllable-state';
import { TabsContext, type TabsContextValue } from './tabs-context';

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';
  children: ReactNode;
}

export function TabsRoot(props: TabsProps) {
  const { orientation = 'horizontal', activationMode = 'automatic', children } = props;

  const [value, setValueRaw] = useControllableState(props.value, props.defaultValue ?? '', props.onValueChange);

  const [direction, setDirection] = useState<1 | -1>(1);
  const tabsId = useId();
  const tabElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const tabOrderRef = useRef<string[]>([]);
  const listRef = useRef<HTMLElement | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const registerTab = useCallback((tabValue: string, element: HTMLElement | null) => {
    if (element) {
      tabElementsRef.current.set(tabValue, element);
      if (!tabOrderRef.current.includes(tabValue)) {
        tabOrderRef.current.push(tabValue);
      }
    } else {
      tabElementsRef.current.delete(tabValue);
    }
  }, []);

  const getTabElement = useCallback((tabValue: string) => {
    return tabElementsRef.current.get(tabValue) ?? null;
  }, []);

  const setValue = useCallback(
    (newValue: string) => {
      const prevIndex = tabOrderRef.current.indexOf(valueRef.current);
      const nextIndex = tabOrderRef.current.indexOf(newValue);
      if (prevIndex !== -1 && nextIndex !== -1) {
        setDirection(nextIndex > prevIndex ? 1 : -1);
      }
      setValueRaw(newValue);
    },
    [setValueRaw],
  );

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      value,
      setValue,
      orientation,
      activationMode,
      tabsId,
      registerTab,
      getTabElement,
      listRef,
      direction,
    }),
    [value, setValue, orientation, activationMode, tabsId, registerTab, getTabElement, direction],
  );

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}
