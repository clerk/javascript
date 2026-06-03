'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode } from 'react';
import { DialogScopedContext, useDialogContext } from './dialog-context';

export interface DialogPortalProps {
  children: ReactNode;
  root?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

export function DialogPortal(props: DialogPortalProps) {
  const { mounted } = useDialogContext();
  const isScoped = props.root != null;

  if (!mounted) return null;

  return (
    <FloatingPortal root={props.root}>
      <DialogScopedContext.Provider value={isScoped}>{props.children}</DialogScopedContext.Provider>
    </FloatingPortal>
  );
}
