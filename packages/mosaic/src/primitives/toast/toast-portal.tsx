'use client';

import type { ReactNode, RefObject } from 'react';

import { Portal } from '../portal';

export interface ToastPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | RefObject<HTMLElement | null>;
}

export function ToastPortal(props: ToastPortalProps) {
  return <Portal root={props.root}>{props.children}</Portal>;
}
