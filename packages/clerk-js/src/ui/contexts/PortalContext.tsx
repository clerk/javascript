import { createContext, useContext, useMemo } from 'react';

export * from './usePortalConfig';

export type PortalConfig = {
  /**
   * If true, portals will be disabled and components will render inline.
   * @default false
   */
  disablePortal?: boolean;
  /**
   * Portal ID to render portals into. If provided, portals will render into an element with this ID.
   * @default undefined
   */
  portalId?: string;
  /**
   * Custom container element to render portals into. Can be an HTMLElement or a function that returns one.
   * @default document.body
   */
  portalRoot?: HTMLElement | (() => HTMLElement | null);
};

const PortalContext = createContext<PortalConfig | null>(null);

export const PortalProvider = ({
  children,
  disablePortal,
  portalId,
  portalRoot,
}: React.PropsWithChildren<PortalConfig>) => {
  const parentConfig = usePortalContext();
  const config = useMemo<PortalConfig>(
    () => ({
      // Merge with parent config, with props taking precedence
      disablePortal: disablePortal ?? parentConfig?.disablePortal,
      portalId: portalId ?? parentConfig?.portalId,
      portalRoot: portalRoot ?? parentConfig?.portalRoot,
    }),
    [disablePortal, portalId, portalRoot, parentConfig],
  );

  return <PortalContext.Provider value={config}>{children}</PortalContext.Provider>;
};

export const usePortalContext = (): PortalConfig | null => {
  return useContext(PortalContext);
};

/**
 * Hook to extract and resolve the portal root element from portal context.
 * Handles both function and HTMLElement cases, with optional fallback.
 *
 * @param fallback - Optional fallback value if no portal root is found in context
 * @returns The resolved HTMLElement or undefined
 *
 * @example
 * ```tsx
 * // Use context only
 * const portalRoot = usePortalRoot();
 *
 * // Use context with fallback
 * const portalRoot = usePortalRoot(modalRoot?.current);
 * ```
 */
export const usePortalRoot = (
  fallback?: HTMLElement | React.MutableRefObject<HTMLElement | null> | null,
): HTMLElement | undefined => {
  const portalConfig = usePortalContext();

  return useMemo(() => {
    if (portalConfig?.portalRoot) {
      const root = typeof portalConfig.portalRoot === 'function' ? portalConfig.portalRoot() : portalConfig.portalRoot;
      return root || undefined;
    }

    // Handle fallback - could be HTMLElement or MutableRefObject
    if (fallback) {
      return 'current' in fallback ? fallback.current || undefined : fallback || undefined;
    }

    return undefined;
  }, [portalConfig?.portalRoot, fallback]);
};
