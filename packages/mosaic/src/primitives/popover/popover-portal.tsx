'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
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
  return <Portal root={props.root}>{props.children}</Portal>;
}
