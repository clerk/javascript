'use client';

import type { ReactNode, RefObject } from 'react';

import { Portal } from '../portal';
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
  return <Portal root={props.root}>{props.children}</Portal>;
}
