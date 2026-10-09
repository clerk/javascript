import { createContext, useContext } from 'react';

export type TabsDirection = 'forward' | 'backward';

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  tabsId: string;
  registerTab: (value: string, element: HTMLElement | null) => void;
  direction: TabsDirection;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs.Root>');
  }
  return ctx;
}
