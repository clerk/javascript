'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

import { usePopoverContext } from './popover-context';

export interface PopoverPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function PopoverPortal(props: PopoverPortalProps) {
  const { mounted } = usePopoverContext();
  if (!mounted) {
    return null;
  }
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
