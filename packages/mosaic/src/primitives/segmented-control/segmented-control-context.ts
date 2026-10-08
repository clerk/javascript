import { createContext, useContext } from 'react';

export type SegmentedControlDirection = 'forward' | 'backward';

export interface SegmentedControlContextValue {
  value: string;
  select: (value: string) => void;
  registerItem: (value: string, element: HTMLElement | null) => void;
  disabled: boolean;
  direction: SegmentedControlDirection;
}

export const SegmentedControlContext = createContext<SegmentedControlContextValue | null>(null);

export function useSegmentedControlContext() {
  const ctx = useContext(SegmentedControlContext);
  if (!ctx) {
    throw new Error('SegmentedControl compound components must be used within <SegmentedControl.Root>');
  }
  return ctx;
}
