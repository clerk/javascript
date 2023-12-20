import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext } from 'react';

/**
 * This type represents a generic router interface that Clerk relies on to interact with the host router.
 */
export type ClerkHostRouter = {
  push: (path: string) => void;
  replace: (path: string) => void;
  pathname: () => string;
  searchParams: () => URLSearchParams;
};

export type ClerkRouter = {
  child: (childBasePath: string) => ClerkRouter;
  matches: (path: string) => boolean;
  push: ClerkHostRouter['push'];
  replace: ClerkHostRouter['replace'];
};

/**
 * Ensures the provided path has a leading slash and no trailing slash
 */
function normalizePath(path: string) {
  const pathNoTrailingSlash = path.replace(/\/$/, '');
  return pathNoTrailingSlash.startsWith('/') ? pathNoTrailingSlash : `/${pathNoTrailingSlash}`;
}

export function createClerkRouter(router: ClerkHostRouter, basePath: string = '/'): ClerkRouter {
  const normalizedBasePath = normalizePath(basePath);

  function matches(path: string) {
    const normalizedPath = normalizePath(path);

    return normalizePath(`${normalizedBasePath}${normalizedPath}`) === router.pathname();
  }

  function child(childBasePath: string) {
    return createClerkRouter(router, `${normalizedBasePath}/${normalizePath(childBasePath)}`);
  }

  return {
    child,
    matches,
    push: router.push,
    replace: router.replace,
  };
}

export const ClerkRouterContext = createContext<ClerkRouter | null>(null);

function useClerkRouter() {
  return useContext(ClerkRouterContext);
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

  const pathToMatch = path ?? (index && '/');

  if (!pathToMatch) {
    throw new Error('Route must have a path or index prop');
  }

  if (!parentRouter?.matches(pathToMatch)) {
    return null;
  }

  return children;
}

/**
 * Framework specific router integrations
 */

export const useNextRouter = (): ClerkHostRouter => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    pathname: () => pathname,
    searchParams: () => searchParams,
  };
};
