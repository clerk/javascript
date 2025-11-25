'use client';

import React, { useEffect, useRef } from 'react';

import { createContextAndHook } from './hooks/createContextAndHook';
import { portalRootManager } from './portal-root-manager';

type PortalProviderProps = React.PropsWithChildren<{
  /**
   * Function that returns the container element where portals should be rendered.
   * This allows Clerk components to render inside external dialogs/popovers
   * (e.g., Radix Dialog, React Aria Components) instead of document.body.
   */
  getContainer: () => HTMLElement | null;
}>;

const [PortalContext, , usePortalContextWithoutGuarantee] = createContextAndHook<{
  getContainer: () => HTMLElement | null;
}>('PortalProvider');

/**
 * PortalProvider allows you to specify a custom container for all Clerk floating UI elements
 * (popovers, modals, tooltips, etc.) that use portals.
 *
 * This is particularly useful when using Clerk components inside external UI libraries
 * like Radix Dialog or React Aria Components, where portaled elements need to render
 * within the dialog's container to remain interactable.
 *
 * @example
 * ```tsx
 * function Example() {
 *   const containerRef = useRef(null);
 *   return (
 *     <RadixDialog ref={containerRef}>
 *       <PortalProvider getContainer={() => containerRef.current}>
 *         <UserButton />
 *       </PortalProvider>
 *     </RadixDialog>
 *   );
 * }
 * ```
 */
export const PortalProvider = ({ children, getContainer }: PortalProviderProps) => {
  const getContainerRef = useRef(getContainer);
  getContainerRef.current = getContainer;

  // Register with the manager for cross-tree access (e.g., modals in Components.tsx)
  useEffect(() => {
    const getContainerWrapper = () => getContainerRef.current();
    portalRootManager.push(getContainerWrapper);
    return () => {
      portalRootManager.pop();
    };
  }, []);

  // Provide context for same-tree access (e.g., UserButton popover)
  const contextValue = React.useMemo(() => ({ value: { getContainer } }), [getContainer]);

  return <PortalContext.Provider value={contextValue}>{children}</PortalContext.Provider>;
};

/**
 * Hook to get the current portal root container.
 * First checks React context (for same-tree components),
 * then falls back to PortalRootManager (for cross-tree like modals).
 */
export const usePortalRoot = (): HTMLElement | null => {
  // Try to get from context first (for components in the same React tree)
  const contextValue = usePortalContextWithoutGuarantee();
  if (contextValue && 'getContainer' in contextValue) {
    return contextValue.getContainer();
  }

  // Fall back to manager (for components in different React trees, like modals)
  return portalRootManager.getCurrent();
};
