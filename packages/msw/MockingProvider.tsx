'use client';

import { createContext, ReactNode, useContext } from 'react';

import type { MockScenario } from './types';
import { usePageMocking } from './usePageMocking';

interface MockingContextValue {
  error: Error | null;
  isEnabled: boolean;
  isReady: boolean;
  pathname: string;
}

const MockingContext = createContext<MockingContextValue | null>(null);

interface MockingProviderProps {
  children: ReactNode;
  debug?: boolean;
  delay?: number | { min: number; max: number };
  persist?: boolean;
  scenario?: () => MockScenario;
}

export function MockingProvider({ children, debug, delay, persist, scenario }: MockingProviderProps) {
  const mockingState = usePageMocking({ debug, delay, persist, scenario });

  return <MockingContext.Provider value={mockingState}>{children}</MockingContext.Provider>;
}

export function useMockingContext() {
  const context = useContext(MockingContext);
  if (!context) {
    throw new Error('useMockingContext must be used within a MockingProvider');
  }
  return context;
}
