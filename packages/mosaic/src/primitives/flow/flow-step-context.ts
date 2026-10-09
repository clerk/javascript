'use client';

import { createContext, type RefCallback, useCallback, useContext, useRef } from 'react';

export interface FlowStepContextValue {
  active: boolean;
  registerFocusTarget: (element: HTMLElement) => void;
  unregisterFocusTarget: (element: HTMLElement) => void;
}

export const FlowStepContext = createContext<FlowStepContextValue | null>(null);

export function useFlowStepActive(): boolean {
  return useContext(FlowStepContext)?.active ?? true;
}

/**
 * Marks an element as the one to focus when the enclosing `Flow.Step` enters.
 * When several mounted elements are marked, the first in DOM order is focused. Outside a
 * step the ref is a no-op, so a view can render standalone without a wrapper.
 */
export function useFlowAutoFocus<T extends HTMLElement = HTMLElement>(): RefCallback<T> {
  const context = useContext(FlowStepContext);
  const elementRef = useRef<T | null>(null);

  return useCallback(
    (element: T | null) => {
      if (element) {
        elementRef.current = element;
        context?.registerFocusTarget(element);
        return;
      }
      if (elementRef.current) {
        context?.unregisterFocusTarget(elementRef.current);
        elementRef.current = null;
      }
    },
    [context],
  );
}
