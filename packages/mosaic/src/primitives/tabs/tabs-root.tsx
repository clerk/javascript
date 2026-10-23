'use client';

import { type ReactNode, useCallback, useId, useMemo, useReducer, useRef } from 'react';

import { TabsContext, type TabsContextValue, type TabsDirection } from './tabs-context';

interface SelectionState {
  value: string;
  direction: TabsDirection;
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

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  activationMode?: 'automatic' | 'manual';
  children: ReactNode;
}

export function TabsRoot(props: TabsProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    orientation = 'horizontal',
    activationMode = 'automatic',
    children,
  } = props;

  const [selection, dispatch] = useReducer(selectionReducer, {
    value: valueProp ?? defaultValue ?? '',
    direction: 'forward',
  });
  const tabsId = useId();
  const tabElementsRef = useRef(new Map<string, HTMLElement>());

  const registerTab = useCallback((tabValue: string, element: HTMLElement | null) => {
    if (element) {
      tabElementsRef.current.set(tabValue, element);
    } else {
      tabElementsRef.current.delete(tabValue);
    }
  }, []);

  const getIndex = useCallback((tabValue: string) => {
    const element = tabElementsRef.current.get(tabValue);
    if (!element) {
      return -1;
    }
    return Array.from(tabElementsRef.current.values()).filter(
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

  const setValue = useCallback(
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

  const contextValue = useMemo<TabsContextValue>(
    () => ({ value, setValue, orientation, activationMode, tabsId, registerTab, direction }),
    [value, setValue, orientation, activationMode, tabsId, registerTab, direction],
  );

  return <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>;
}
