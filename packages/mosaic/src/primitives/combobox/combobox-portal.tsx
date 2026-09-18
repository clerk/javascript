'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

import { useComboboxContext } from './combobox-context';

export interface ComboboxPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function ComboboxPortal(props: ComboboxPortalProps) {
  const { mounted } = useComboboxContext();
  if (!mounted) {
    return null;
  }
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
