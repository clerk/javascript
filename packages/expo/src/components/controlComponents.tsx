// Re-export control components from @clerk/react
// These provide conditional rendering based on auth state
export { ClerkLoaded, ClerkLoading, Show } from '@clerk/react';

import type { PropsWithChildren, ReactNode } from 'react';
import { Show } from '@clerk/react';

/**
 * Render children only when the user is signed in.
 * A convenience wrapper around `<Show when="signed-in">`.
 */
export function SignedIn({ children }: PropsWithChildren): ReactNode {
  return <Show when='signed-in'>{children}</Show>;
}

/**
 * Render children only when the user is signed out.
 * A convenience wrapper around `<Show when="signed-out">`.
 */
export function SignedOut({ children }: PropsWithChildren): ReactNode {
  return <Show when='signed-out'>{children}</Show>;
}
