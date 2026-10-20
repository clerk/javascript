'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
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
  return <Portal root={props.root}>{props.children}</Portal>;
}
