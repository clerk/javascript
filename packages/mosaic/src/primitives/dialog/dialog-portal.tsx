'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';

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

  return <FloatingPortal root={props.root}>{props.children}</FloatingPortal>;
}
