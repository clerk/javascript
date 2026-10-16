'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode, RefObject } from 'react';

export interface ToastPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | RefObject<HTMLElement | null>;
}

export function ToastPortal(props: ToastPortalProps) {
  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
