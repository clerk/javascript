'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode, RefObject } from 'react';

import { useTooltipContext } from './tooltip-context';

export interface TooltipPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | RefObject<HTMLElement | null>;
}

export function TooltipPortal(props: TooltipPortalProps) {
  const { mounted } = useTooltipContext();
  if (!mounted) {
    return null;
  }
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
