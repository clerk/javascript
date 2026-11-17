'use client';

import type { ReactNode } from 'react';

import { Portal } from '../portal';
import { useDialogContext } from './dialog-context';

export interface DialogPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function DialogPortal(props: DialogPortalProps) {
  const { mounted } = useDialogContext();

  if (!mounted) {
    return null;
  }

  return <Portal root={props.root}>{props.children}</Portal>;
}
