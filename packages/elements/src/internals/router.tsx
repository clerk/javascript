import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * This type represents a generic router interface that Clerk relies on to interact with the host router.
 */
export type ClerkHostRouter = {
  push: (path: string) => void;
  replace: (path: string) => void;
  pathname: () => string;
  searchParams: () => URLSearchParams;
};

/**
 * Internal Clerk router, used by Clerk components to interact with the host's router.
 */
export type ClerkRouter = {
  /**
   * Creates a child router instance scoped to the provided base path.
   */
  child: (childBasePath: string) => ClerkRouter;
  /**
   * Matches the provided path against the router's current path. If index is provided, matches against the root route of the router.
   */
  match: (path?: string, index?: boolean) => boolean;
  /**
   * Navigates to the provided path via a history push
   */
  push: ClerkHostRouter['push'];
  /**
   * Navigates to the provided path via a history replace
   */
  replace: ClerkHostRouter['replace'];
  /**
   * Returns the current pathname (including the base path)
   */
  pathname: ClerkHostRouter['pathname'];
  /**
   * Returns the current search params
   */
  searchParams: ClerkHostRouter['searchParams'];
};

/**
 * Ensures the provided path has a leading slash and no trailing slash
 */
function normalizePath(path: string) {
  const pathNoTrailingSlash = path.replace(/\/$/, '');
  return pathNoTrailingSlash.startsWith('/') ? pathNoTrailingSlash : `/${pathNoTrailingSlash}`;
}

/**
 * Factory function to create an instance of ClerkRouter with the provided host router.
 *
 * @param router host router instance to be used by the router
 * @param basePath base path of the router, navigation and matching will be scoped to this path
 * @returns A ClerkRouter instance
 */
export function createClerkRouter(router: ClerkHostRouter, basePath: string = '/'): ClerkRouter {
  const normalizedBasePath = normalizePath(basePath);

  function match(path?: string, index?: boolean) {
    const pathToMatch = path ?? (index && '/');

    if (!pathToMatch) {
      throw new Error('[clerk] router.match() requires either a path to match, or the index flag must be set to true.');
    }

    const normalizedPath = normalizePath(pathToMatch);

    return normalizePath(`${normalizedBasePath}${normalizedPath}`) === normalizePath(router.pathname());
  }

  function child(childBasePath: string) {
    return createClerkRouter(router, `${normalizedBasePath}/${normalizePath(childBasePath)}`);
  }

  return {
    child,
    match,
    push: router.push,
    replace: router.replace,
    pathname: router.pathname,
    searchParams: router.searchParams,
  };
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
