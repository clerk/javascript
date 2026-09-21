import { createContext, useContext } from 'react';

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  activationMode: 'automatic' | 'manual';
  tabsId: string;
  registerTab: (value: string, element: HTMLElement | null) => void;
  getTabElement: (value: string) => HTMLElement | null;
  // The list element is tracked as state (not a ref) so the indicator, a child,
  // re-renders once the list mounts. A child's layout effect runs before its
  // parent's ref is attached, so a plain ref would read null on first measure.
  listElement: HTMLElement | null;
  setListElement: (element: HTMLElement | null) => void;
  direction: 1 | -1;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('Tabs compound components must be used within <Tabs.Root>');
  }
  return ctx;
}
