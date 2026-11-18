'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
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

  return <Portal root={props.root}>{props.children}</Portal>;
}
