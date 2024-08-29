/**
 * React-specific binding's for interacting with Clerk's router interface.
 */
import React, { createContext, useContext } from 'react';

import type { ClerkHostRouter, ClerkRouter } from './router';
import { createClerkRouter } from './router';

export const ClerkRouterContext = createContext<ClerkRouter | null>(null);

export function useClerkRouter() {
  const ctx = useContext(ClerkRouterContext);

  if (!ctx) {
    throw new Error('clerk: Unable to locate ClerkRouter, make sure this is rendered within `<Router>`.');
  }

  return ctx;
}

/**
 * Construct a Clerk Router using the provided host router. The router instance is accessible using `useClerkRouter()`.
 */
export function Router({
  basePath,
  children,
  router,
}: {
  children: React.ReactNode;
  basePath?: string;
  router: ClerkHostRouter;
}) {
  const clerkRouter = createClerkRouter(router, basePath);

  return <ClerkRouterContext.Provider value={clerkRouter}>{children}</ClerkRouterContext.Provider>;
}

type RouteProps = { path?: string; index?: boolean };

/**
 * Used to conditionally render its children based on whether or not the current path matches the provided path.
 */
export function Route({ path, children, index }: RouteProps & { children: React.ReactNode }) {
  const parentRouter = useClerkRouter();

  if (!path && !index) {
    return children;
  }

  if (!parentRouter?.match(path, index)) {
    return null;
  }

  return children;
}
