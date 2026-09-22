import { createContext, useContext } from 'react';

export interface CollapsibleContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

export function useCollapsibleContext() {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error('Collapsible compound components must be used within <Collapsible.Root>');
  }
  return ctx;
}
