import React, { createContext, useContext } from 'react';

type PortalProviderContextValue = {
  /**
   * Returns the container element where portaled content should be rendered.
   * Can return an HTMLElement, a React ref object, or `null` to disable portaling.
   *
   * @returns The HTMLElement or React.MutableRefObject<HTMLElement | null> to portal to, or `null` to disable portaling
   */
  getContainer: () => HTMLElement | React.MutableRefObject<HTMLElement | null> | null;
};

const PortalContext = createContext<PortalProviderContextValue | null>(null);

const defaultGetContainer = (): HTMLElement => {
  if (typeof document === 'undefined') {
    throw new Error('PortalProvider: document is not available');
  }
  return document.body;
};

/**
 * PortalProvider allows you to control where Clerk components portal their overlays
 * (modals, popovers, etc.) by providing a `getContainer` function.
 *
 * This provider coexists with the `portal` prop on individual components. The `portal`
 * prop and `root` prop on individual components take precedence over this provider.
 *
 * **Priority order:**
 * 1. `root` prop on component (highest priority)
 * 2. `portal` prop on component
 * 3. PortalProvider `getContainer()` function (lowest priority)
 *
 * @example
 * Portal to a custom container:
 * ```tsx
 * <PortalProvider getContainer={() => document.getElementById('my-portal-root')}>
 *   <UserButton />
 *   <OrganizationSwitcher />
 * </PortalProvider>
 * ```
 *
 * @example
 * Portal to a container using a ref (like React Aria Components):
 * ```tsx
 * const container = React.useRef(null);
 * <PortalProvider getContainer={() => container.current}>
 *   <UserButton />
 * </PortalProvider>
 * ```
 *
 * @example
 * Disable portaling (simple):
 * ```tsx
 * <PortalProvider disablePortal>
 *   <SignUp />
 * </PortalProvider>
 * ```
 *
 * @example
 * Disable portaling (using getContainer):
 * ```tsx
 * <PortalProvider getContainer={() => null}>
 *   <UserButton />
 * </PortalProvider>
 * ```
 * Note: This is similar to `portal={false}`, but the `portal` prop takes precedence.
 *
 * @example
 * PortalProvider can be used alongside the `portal` prop. The prop takes precedence:
 * ```tsx
 * <PortalProvider getContainer={() => document.getElementById('custom-root')}>
 *   <UserButton />
 *   <UserButton portal={true} />
 *   <UserButton portal={false} />
 * </PortalProvider>
 * ```
 */
type PortalProviderProps = {
  children: React.ReactNode;
  /**
   * Function that returns the container element where portaled content should be rendered.
   * Returning `null` will disable portaling for components that respect this context.
   */
  getContainer?: () => HTMLElement | React.MutableRefObject<HTMLElement | null> | null;
  /**
   * If `true`, disables portaling for all components within this provider.
   * This is a convenience prop that's equivalent to `getContainer={() => null}`.
   * @default false
   */
  disablePortal?: boolean;
};

export const PortalProvider = ({ children, getContainer, disablePortal = false }: PortalProviderProps) => {
  const resolvedGetContainer = React.useCallback(() => {
    if (disablePortal) {
      return null;
    }
    if (getContainer) {
      return getContainer();
    }
    // Default behavior: portal to document.body
    return defaultGetContainer();
  }, [disablePortal, getContainer]);

  return <PortalContext.Provider value={{ getContainer: resolvedGetContainer }}>{children}</PortalContext.Provider>;
};

/**
 * Hook to access the PortalProvider context.
 * Returns the `getContainer` function from the nearest PortalProvider, or a default
 * function that returns `document.body` if no provider is found.
 *
 * This hook is primarily used internally by Clerk components. For custom components
 * that need to respect the PortalProvider, use this hook to get the container.
 *
 * @returns The portal context value with `getContainer` function
 *
 * @example
 * ```tsx
 * function MyCustomModal() {
 *   const { getContainer } = usePortalContext();
 *   const container = getContainer();
 *   if (container === null) {
 *     return <div>Modal content</div>;
 *   }
 *   return ReactDOM.createPortal(<div>Modal content</div>, container);
 * }
 * ```
 */
export const usePortalContext = (): PortalProviderContextValue => {
  const context = useContext(PortalContext);
  if (context) {
    return context;
  }
  // Default behavior: portal to document.body
  return { getContainer: defaultGetContainer };
};
