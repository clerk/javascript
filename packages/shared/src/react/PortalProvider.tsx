'use client';

import React from 'react';

import { createContextAndHook } from './hooks/createContextAndHook';

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
 * UNSAFE_PortalProvider allows you to specify a custom container for Clerk floating UI elements
 * (popovers, modals, tooltips, etc.) that use portals.
 *
 * Only components within this provider will be affected. Components outside the provider
 * will continue to use the default document.body for portals.
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
 *       <UNSAFE_PortalProvider getContainer={() => containerRef.current}>
 *         <UserButton />
 *       </UNSAFE_PortalProvider>
 *     </RadixDialog>
 *   );
 * }
 * ```
 */
export const UNSAFE_PortalProvider = ({ children, getContainer }: PortalProviderProps) => {
  const contextValue = React.useMemo(() => ({ value: { getContainer } }), [getContainer]);

  return <PortalContext.Provider value={contextValue}>{children}</PortalContext.Provider>;
};

UNSAFE_PortalProvider.displayName = 'UNSAFE_PortalProvider';

/**
 * Hook to get the current portal root container.
 * Returns the getContainer function from context if inside a PortalProvider,
 * otherwise returns a function that returns null (default behavior).
 */
export const usePortalRoot = (): (() => HTMLElement | null) => {
  const contextValue = usePortalContextWithoutGuarantee();

  if (contextValue && 'getContainer' in contextValue && contextValue.getContainer) {
    return contextValue.getContainer;
  }

  // Return a function that returns null when not inside a PortalProvider
  return () => null;
};
