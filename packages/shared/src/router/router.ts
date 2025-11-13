import type { ClerkHostRouter, RoutingMode } from '../types';
import { isAbsoluteUrl, withLeadingSlash, withoutTrailingSlash } from '../url';

export const PRESERVED_QUERYSTRING_PARAMS = ['after_sign_in_url', 'after_sign_up_url', 'redirect_url'];

/**
 * Internal Clerk router, used by Clerk components to interact with the host's router.
 */
export type ClerkRouter = {
  makeDestinationUrlWithPreservedQueryParameters: (path: string) => string;
  /**
   * The basePath the router is currently mounted on.
   */
  basePath: string;
  /**
   * Creates a child router instance scoped to the provided base path.
   */
  child: (childBasePath: string) => ClerkRouter;
  /**
   * Matches the provided path against the router's current path. If index is provided, matches against the root route of the router.
   */
  match: (path?: string, index?: boolean) => boolean;

  /**
   * Mode of the router instance, path-based or virtual
   */
  readonly mode: RoutingMode;

  /**
   * Name of the router instance
   */
  readonly name: string;

  /**
   * Navigates to the provided path via a history push
   */
  push: ClerkHostRouter['push'];
  /**
   * Navigates to the provided path via a history replace
   */
  replace: ClerkHostRouter['replace'];
  /**
   * If supported by the host router, navigates to the provided path without triggering a full navigation
   */
  shallowPush: ClerkHostRouter['shallowPush'];
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
  return withoutTrailingSlash(withLeadingSlash(path));
}

/**
 * Factory function to create an instance of ClerkRouter with the provided host router.
 *
 * @param router - host router instance to be used by the router
 * @param basePath - base path of the router, navigation and matching will be scoped to this path
 * @returns A ClerkRouter instance
 */
export function createClerkRouter(router: ClerkHostRouter, basePath: string = '/'): ClerkRouter {
  const normalizedBasePath = normalizePath(basePath);

  /**
   * Certain query parameters need to be preserved when navigating internally. These query parameters are ultimately used by Clerk to dictate behavior, so we keep them around.
   */
  function makeDestinationUrlWithPreservedQueryParameters(path: string) {
    // If the provided path is an absolute URL, return it unmodified.
    if (isAbsoluteUrl(path)) {
      return path;
    }

    const destinationUrl = new URL(path, window.location.origin);
    const currentSearchParams = router.searchParams();

    PRESERVED_QUERYSTRING_PARAMS.forEach(key => {
      const maybeValue = currentSearchParams.get(key);
      if (maybeValue) {
        destinationUrl.searchParams.set(key, maybeValue);
      }
    });

    return `${destinationUrl.pathname}${destinationUrl.search}`;
  }

  /**
   *
   */
  function match(path?: string, index?: boolean) {
    const pathToMatch = path ?? (index && '/');

    if (!pathToMatch) {
      throw new Error('[clerk] router.match() requires either a path to match, or the index flag must be set to true.');
    }

    const normalizedPath = normalizePath(pathToMatch);

    return normalizePath(`${normalizedBasePath}${normalizedPath}`) === normalizePath(router.pathname());
  }

  /**
   *
   */
  function child(childBasePath: string) {
    return createClerkRouter(router, `${normalizedBasePath}${normalizePath(childBasePath)}`);
  }

  /**
   *
   */
  function push(path: string) {
    const destinationUrl = makeDestinationUrlWithPreservedQueryParameters(path);
    return router.push(destinationUrl);
  }

  /**
   *
   */
  function replace(path: string) {
    const destinationUrl = makeDestinationUrlWithPreservedQueryParameters(path);
    return router.replace(destinationUrl);
  }

  /**
   *
   */
  function shallowPush(path: string) {
    const destinationUrl = makeDestinationUrlWithPreservedQueryParameters(path);
    return router.shallowPush(destinationUrl);
  }

  /**
   *
   */
  function pathname() {
    return router.pathname();
  }

  /**
   *
   */
  function searchParams() {
    return router.searchParams();
  }

  return {
    makeDestinationUrlWithPreservedQueryParameters,
    child,
    match,
    mode: router.mode,
    name: router.name,
    push,
    replace,
    shallowPush,
    pathname,
    searchParams,
    basePath: normalizedBasePath,
  };
}

export type { ClerkHostRouter, RoutingMode };
