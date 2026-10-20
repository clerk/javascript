'use client';

import { FloatingPortal } from '@floating-ui/react';
import type { ReactNode, RefObject } from 'react';
import React from 'react';

export type PortalContainer = RefObject<HTMLElement | null> | HTMLElement | null;

export interface PortalProviderProps {
  /**
   * Where Mosaic overlays below this provider portal to, instead of `document.body`. Overlays wait
   * until the container exists.
   */
  container: PortalContainer;
  children: ReactNode;
}

export interface PortalProps {
  children: ReactNode;
  root?: PortalContainer;
}

const PortalContainerContext = React.createContext<PortalContainer | undefined>(undefined);
const InsidePortalContext = React.createContext(false);

export function PortalProvider(props: PortalProviderProps): React.ReactElement {
  return (
    <PortalContainerContext.Provider value={props.container}>
      <InsidePortalContext.Provider value={false}>{props.children}</InsidePortalContext.Provider>
    </PortalContainerContext.Provider>
  );
}

export function Portal(props: PortalProps): React.ReactElement {
  const provided = usePortalRoot();
  return (
    <FloatingPortal root={props.root === undefined ? provided : props.root}>
      <InsidePortalContext.Provider value>{props.children}</InsidePortalContext.Provider>
    </FloatingPortal>
  );
}

export function useGetPortalContainer(): (() => HTMLElement | null) | undefined {
  const container = React.useContext(PortalContainerContext);
  if (container === undefined) {
    return undefined;
  }
  return () => resolve(container);
}

function usePortalRoot(): HTMLElement | null | undefined {
  const provided = React.useContext(PortalContainerContext);
  const container = React.useContext(InsidePortalContext) ? undefined : provided;
  const [root, setRoot] = React.useState<HTMLElement | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- A ref's `current` changes without a re-render, so every render checks it again; setting the same element is a no-op.
  React.useEffect(() => {
    if (container !== undefined) {
      setRoot(resolve(container));
    }
  });

  return container === undefined ? undefined : root;
}

function resolve(container: PortalContainer): HTMLElement | null {
  return container !== null && 'current' in container ? container.current : container;
}
