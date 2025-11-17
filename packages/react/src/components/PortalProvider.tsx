import type { PortalProps } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import React from 'react';

/**
 * PortalProvider allows you to control portal behavior for Clerk components.
 * Wrap your Clerk components with PortalProvider to disable portals or specify a custom portal container.
 *
 * @example
 * ```tsx
 * <PortalProvider disablePortal>
 *   <UserButton />
 * </PortalProvider>
 * ```
 *
 * @example
 * ```tsx
 * const portalRef = useRef(null);
 * <PortalProvider portalRoot={() => portalRef.current}>
 *   <UserButton />
 * </PortalProvider>
 * ```
 */
export const PortalProvider = ({ children, ...portalProps }: PropsWithChildren<PortalProps>) => {
  // PortalProvider in React package wraps children and passes portal config through props
  // The actual portal context is provided in clerk-js when components are mounted
  // We clone children and inject portal props so they flow through to clerk.mount* methods
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Merge portal props with existing props, with portal props taking precedence
          return React.cloneElement(child, {
            ...child.props,
            ...portalProps,
          } as PortalProps);
        }
        return child;
      })}
    </>
  );
};
