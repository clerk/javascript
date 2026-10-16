'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

import { useMenuContext } from './menu-context';

export interface MenuPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function MenuPortal(props: MenuPortalProps) {
  const { mounted } = useMenuContext();
  if (!mounted) {
    return null;
  }
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
