'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
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
  return <Portal root={props.root}>{props.children}</Portal>;
}
