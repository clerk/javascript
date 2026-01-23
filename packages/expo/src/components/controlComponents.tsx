import React from 'react';
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/react';

export { ClerkLoaded, ClerkLoading, Show };

/**
 * Renders children only when a user is signed in.
 * Backward-compatible wrapper around `<Show when="signed-in">`.
 */
export function SignedIn({ children }: React.PropsWithChildren<unknown>) {
  return <Show when='signed-in'>{children}</Show>;
}

/**
 * Renders children only when no user is signed in.
 * Backward-compatible wrapper around `<Show when="signed-out">`.
 */
export function SignedOut({ children }: React.PropsWithChildren<unknown>) {
  return <Show when='signed-out'>{children}</Show>;
}
