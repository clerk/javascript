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

export type ClerkRouter = {
  child: (childBasePath: string) => ClerkRouter;
  match: (path?: string, index?: boolean) => boolean;
  push: ClerkHostRouter['push'];
  replace: ClerkHostRouter['replace'];
  pathname: ClerkHostRouter['pathname'];
  searchParams: ClerkHostRouter['searchParams'];
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

  function match(path?: string, index?: boolean) {
    const pathToMatch = path ?? (index && '/');

    if (!pathToMatch) {
      throw new Error('Route must have a path or index prop');
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
