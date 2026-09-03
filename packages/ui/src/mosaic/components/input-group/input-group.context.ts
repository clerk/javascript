'use client';

import React from 'react';

export type InputGroupSize = 'sm' | 'md' | 'lg';

interface InputGroupContextValue {
  disabled: boolean;
  focusInput: () => void;
  invalid: boolean;
  setInput: (node: HTMLInputElement | null) => void;
  size: InputGroupSize;
}

export const InputGroupContext = React.createContext<InputGroupContextValue | null>(null);

export function useInputGroupContext(): InputGroupContextValue {
  const context = React.useContext(InputGroupContext);
  if (!context) {
    throw new Error('InputGroup parts must be rendered inside <InputGroup.Root>.');
  }
  return context;
}

export function useOptionalInputGroupContext(): InputGroupContextValue | null {
  return React.useContext(InputGroupContext);
}
