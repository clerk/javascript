'use client';

import { FloatingDelayGroup } from '@floating-ui/react';
import type { ReactNode } from 'react';

export interface TooltipGroupProps {
  /** Shared delay config for grouped tooltips. Default: { open: 200, close: 100 } */
  delay?: number | { open?: number; close?: number };
  /** Time in ms before the group resets to non-instant phase. Default: 300 */
  timeoutMs?: number;
  children: ReactNode;
}

export function TooltipGroup(props: TooltipGroupProps) {
  const { delay = { open: 200, close: 100 }, timeoutMs = 300, children } = props;
  return (
    <FloatingDelayGroup
      delay={delay}
      timeoutMs={timeoutMs}
    >
      {children}
    </FloatingDelayGroup>
  );
}
