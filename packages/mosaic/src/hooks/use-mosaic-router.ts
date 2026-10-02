import { useClerk } from '@clerk/shared/react';

export interface MosaicRouter {
  navigate: (to: string) => void | Promise<unknown>;
}

/**
 * Host-agnostic navigation seam for Mosaic.
 *
 * Delegates to `clerk.navigate`, which already routes through the host app's
 * `routerPush`/`routerReplace`. Controllers depend on this hook rather than on
 * Clerk internals, so a future clerk-js mount path or a dedicated Mosaic router
 * only has to change this one file.
 */
export function useMosaicRouter(): MosaicRouter {
  const clerk = useClerk();
  return { navigate: to => clerk.navigate(to) };
}
