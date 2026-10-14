import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { useClerk } from '@clerk/shared/react';

export interface MosaicRouter {
  navigate: (to: string) => void | Promise<unknown>;
  windowNavigate: (to: URL | string) => void;
}

/**
 * Host-agnostic navigation seam for Mosaic.
 *
 * Uses `clerk.navigate` for host routing and the window navigator for hard
 * redirects. Models depend on this hook rather than on Clerk internals, so a
 * future clerk-js mount path or a dedicated Mosaic router only has to change
 * this one file.
 */
export function useMosaicRouter(): MosaicRouter {
  const clerk = useClerk();
  return {
    navigate: to => clerk.navigate(to),
    windowNavigate: to => {
      if (typeof clerk.__internal_windowNavigate === 'function') {
        clerk.__internal_windowNavigate(to);
      } else {
        windowNavigate(to);
      }
    },
  };
}
