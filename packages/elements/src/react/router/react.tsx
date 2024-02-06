'use client';
import { createContext, useContext } from 'react';

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

export function Router({
  children,
  router,
  basePath,
}: {
  router: ClerkHostRouter;
  children: React.ReactNode;
  basePath?: string;
}) {
  const clerkRouter = createClerkRouter(router, basePath);

  return <ClerkRouterContext.Provider value={clerkRouter}>{children}</ClerkRouterContext.Provider>;
}

type RouteProps = { path?: string; index?: boolean };

export function Route({ path, children, index }: RouteProps & { children: React.ReactNode }) {
  // check for parent router, if exists, create child router, otherwise create one
  const parentRouter = useClerkRouter();

  if (!path && !index) {
    return children;
  }

  if (!parentRouter?.match(path, index)) {
    return null;
  }

  return children;
}
