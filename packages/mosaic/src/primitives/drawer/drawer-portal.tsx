'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

import { useDrawerContext } from './drawer-context';

export interface DrawerPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function DrawerPortal(props: DrawerPortalProps) {
  const { mounted } = useDrawerContext();

  if (!mounted) {
    return null;
  }

  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
