import { createContext, useContext } from 'react';

export type FlowDirection = -1 | 1;

export interface FlowContextValue {
  value: string;
  direction: FlowDirection;
  registerActiveStep: (element: HTMLElement) => void;
  unregisterActiveStep: (element: HTMLElement) => void;
}

export const FlowContext = createContext<FlowContextValue | null>(null);

export function useFlowContext(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('Flow compound components must be used within <Flow.Root>');
  }
  return context;
}
