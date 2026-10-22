'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
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
  return <Portal root={props.root}>{props.children}</Portal>;
}
