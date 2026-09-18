'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

import { useSelectContext } from './select-context';

export interface SelectPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function SelectPortal(props: SelectPortalProps) {
  const { mounted } = useSelectContext();
  if (!mounted) {
    return null;
  }
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
