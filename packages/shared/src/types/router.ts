export type RoutingMode = 'path' | 'virtual';

/**
 * This type represents a generic router interface that Clerk relies on to interact with the host router.
 */
export type ClerkHostRouter = {
  readonly mode: RoutingMode;
  readonly name: string;
  pathname: () => string;
  push: (path: string) => void;
  replace: (path: string) => void;
  searchParams: () => URLSearchParams;
  shallowPush: (path: string) => void;
  inferredBasePath?: () => string;
};
