'use client';

import { FloatingDelayGroup } from '@floating-ui/react';
import { createContext, type ReactNode } from 'react';

export const TooltipGroupContext = createContext(false);

export interface TooltipGroupProps {
  /**
   * Shared delay config for grouped tooltips; it replaces each member's own `delay` and
   * `closeDelay`. Default: { open: 200, close: 100 }
   */
  delay?: number | { open?: number; close?: number };
  /** Time in ms before the group resets to non-instant phase. Default: 300 */
  timeoutMs?: number;
  children: ReactNode;
}

export function TooltipGroup(props: TooltipGroupProps) {
  const { delay = { open: 200, close: 100 }, timeoutMs = 300, children } = props;
  return (
    <TooltipGroupContext.Provider value>
      <FloatingDelayGroup
        delay={delay}
        timeoutMs={timeoutMs}
      >
        {children}
      </FloatingDelayGroup>
    </TooltipGroupContext.Provider>
  );
}
