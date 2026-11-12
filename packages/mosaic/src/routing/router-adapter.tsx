'use client';

import { logger } from '@clerk/shared/logger';
import type { ReactNode } from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import type { MosaicRoutingMode } from './use-mosaic-location';

// What a host hands Mosaic so the URL modes read and write the host router's location instead of
// `window`. It is a plain object the host writes from their own framework's hooks, so no framework
// is a dependency of Mosaic. Every method is optional, and a missing one falls back to `window` on
// its own. The pathname comes back as the address bar has it, percent-encoded, because Mosaic
// splits it before it decodes it; the query string is the host's and its values are read decoded.
export interface RouterAdapter {
  /**
   * A hook returning the current pathname, percent-encoded, as `location.pathname` does. `null` or
   * `undefined` means it cannot be read here, as from Next's Pages Router before it is ready, and
   * that read falls back to `window`.
   */
  usePathname?: () => string | null | undefined;
  /**
   * A hook returning the current query string, as a string with or without the leading `?` or as
   * `URLSearchParams`, so Next's `useSearchParams` serves as it is. `null` or `undefined` means it
   * cannot be read here, as on the server, and that read falls back to `window`.
   */
  useSearchParams?: () => string | URLSearchParams | null | undefined;
  /** A hook returning the current hash, percent-encoded, as `location.hash` does. A leading `#` is optional. */
  useHash?: () => string;
  /**
   * Navigates the host router to a URL made of a pathname, query string and hash, adding a history entry.
   * The component sees the result through the adapter's hooks, and through `window.location` for a
   * hook the adapter does not have, read right after the call returns.
   */
  push?: (url: string) => void;
  /** As `push`, replacing the current history entry. */
  replace?: (url: string) => void;
}

export interface MosaicRouting {
  /**
   * The host router's location and navigation. Without it, the URL modes read and write
   * `window.location`. Its hooks are taken from the first render under the provider, so build the
   * adapter once, outside render.
   */
  adapter?: RouterAdapter;
  /**
   * What the names of the params Mosaic keeps in the query string or the hash start with. A
   * component's param is this prefix and its base with dots for slashes, `p.user` for `/user` in the
   * query string.
   *
   * @default { query: 'p.', hash: '' }
   */
  keyPrefix?: { query?: string; hash?: string };
  /**
   * Where Mosaic's own modals keep their entry: in memory, in the hash or the query string, or in
   * the pathname, so a modal survives a reload and Back closes it. In the pathname a modal lives
   * under `path`, the page it opens from and closes back to, as `<path>/modal/user/security`; that
   * page's route has to accept the extra parts. Changing it needs the provider remounted.
   *
   * @default 'virtual'
   */
  modals?: MosaicRoutingMode | { routing: MosaicRoutingMode; path?: string };
}

type AdapterReads = Pick<RouterAdapter, 'usePathname' | 'useSearchParams' | 'useHash'>;

export interface RoutingConfig {
  reads: AdapterReads;
  push: RouterAdapter['push'];
  replace: RouterAdapter['replace'];
  queryPrefix: string;
  hashPrefix: string;
  modals: { routing: MosaicRoutingMode; path: string } | undefined;
}

const defaultConfig: RoutingConfig = {
  reads: {},
  push: undefined,
  replace: undefined,
  queryPrefix: 'p.',
  hashPrefix: '',
  modals: undefined,
};

const RoutingConfigContext = createContext<RoutingConfig>(defaultConfig);

function readsOf(adapter: RouterAdapter | undefined): AdapterReads {
  return { usePathname: adapter?.usePathname, useSearchParams: adapter?.useSearchParams, useHash: adapter?.useHash };
}

function shapeOf(reads: AdapterReads): string {
  return [reads.usePathname, reads.useSearchParams, reads.useHash].map(read => (read ? '1' : '0')).join('');
}

// The hooks an adapter has are fixed on the first render, because the components under the provider
// call them in their own hook order. A later adapter may change what `push` and `replace` do.
export function RouterAdapterProvider({
  adapter,
  keyPrefix,
  modals,
  children,
}: MosaicRouting & { children: ReactNode }) {
  const [reads] = useState(() => readsOf(adapter));
  if (shapeOf(readsOf(adapter)) !== shapeOf(reads)) {
    logger.warnOnce(
      '[Clerk] The routing adapter changed which hooks it has after the first render, so the first set stays in use. Build the adapter once, outside render.',
    );
  }
  const push = adapter?.push;
  const replace = adapter?.replace;
  const queryPrefix = keyPrefix?.query ?? defaultConfig.queryPrefix;
  const hashPrefix = keyPrefix?.hash ?? defaultConfig.hashPrefix;
  const modalsRouting = typeof modals === 'string' ? modals : modals?.routing;
  const modalsPath = typeof modals === 'string' ? undefined : modals?.path;
  const value = useMemo(
    () => ({
      reads,
      push,
      replace,
      queryPrefix,
      hashPrefix,
      modals: modalsRouting === undefined ? undefined : { routing: modalsRouting, path: modalsPath ?? '' },
    }),
    [reads, push, replace, queryPrefix, hashPrefix, modalsRouting, modalsPath],
  );
  return <RoutingConfigContext.Provider value={value}>{children}</RoutingConfigContext.Provider>;
}

export function useRoutingConfig(): RoutingConfig {
  return useContext(RoutingConfigContext);
}
