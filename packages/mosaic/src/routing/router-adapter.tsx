'use client';

import { logger } from '@clerk/shared/logger';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { MosaicRoutingMode } from './use-mosaic-location';
import { markSettled } from './window-location';

export type ModalRoutingMode = Exclude<MosaicRoutingMode, 'path'>;

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
  /**
   * A hook returning the current hash, percent-encoded, as `location.hash` does. A leading `#` is
   * optional. It is read only once the page has hydrated, since a server has no hash.
   */
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
   * component's param is this prefix and its base with dots for slashes, `.user` for `/user` and
   * `.modal.user` for the profile modal, so a leading dot keeps them apart from the host's params.
   *
   * @default { query: '', hash: '' }
   */
  keyPrefix?: { query?: string; hash?: string };
  /**
   * Where Mosaic's own modals keep their entry: in memory, or in the hash or the query string, so a
   * modal survives a reload and Back closes it. Changing it needs the provider remounted.
   *
   * @default 'virtual'
   */
  modals?: ModalRoutingMode;
}

export type AdapterRead = NonNullable<RouterAdapter['usePathname' | 'useSearchParams' | 'useHash']>;

export type AdapterReads = Record<'usePathname' | 'useSearchParams' | 'useHash', AdapterRead>;

function useNothing(): undefined {
  return undefined;
}

export interface RoutingConfig {
  reads: AdapterReads;
  push: RouterAdapter['push'];
  replace: RouterAdapter['replace'];
  queryPrefix: string;
  hashPrefix: string;
  modals: ModalRoutingMode | undefined;
}

const defaultConfig: RoutingConfig = {
  reads: { usePathname: useNothing, useSearchParams: useNothing, useHash: useNothing },
  push: undefined,
  replace: undefined,
  queryPrefix: '',
  hashPrefix: '',
  modals: undefined,
};

const RoutingConfigContext = createContext<RoutingConfig>(defaultConfig);

// Every read is a hook, `useNothing` where the adapter has none, so a component calls its read
// unconditionally and `window` fills in for what comes back empty.
function readsOf(adapter: RouterAdapter | undefined): AdapterReads {
  return {
    usePathname: adapter?.usePathname ?? useNothing,
    useSearchParams: adapter?.useSearchParams ?? useNothing,
    useHash: adapter?.useHash ?? useNothing,
  };
}

function shapeOf(adapter: RouterAdapter | undefined): string {
  return [adapter?.usePathname, adapter?.useSearchParams, adapter?.useHash].map(read => (read ? '1' : '0')).join('');
}

// The hooks an adapter has are fixed on the first render, because the components under the provider
// call them in their own hook order. A later adapter may change what `push` and `replace` do.
export function RoutingConfigProvider({
  adapter,
  keyPrefix,
  modals,
  children,
}: MosaicRouting & { children: ReactNode }) {
  const [{ reads, shape }] = useState(() => ({ reads: readsOf(adapter), shape: shapeOf(adapter) }));
  if (shapeOf(adapter) !== shape) {
    logger.warnOnce(
      '[Clerk] The routing adapter changed which hooks it has after the first render, so the first set stays in use. Build the adapter once, outside render.',
    );
  }
  useEffect(() => {
    queueMicrotask(markSettled);
  }, []);
  const push = adapter?.push;
  const replace = adapter?.replace;
  const queryPrefix = keyPrefix?.query ?? defaultConfig.queryPrefix;
  const hashPrefix = keyPrefix?.hash ?? defaultConfig.hashPrefix;
  const value = useMemo(
    () => ({
      reads,
      push,
      replace,
      queryPrefix,
      hashPrefix,
      modals,
    }),
    [reads, push, replace, queryPrefix, hashPrefix, modals],
  );
  return <RoutingConfigContext.Provider value={value}>{children}</RoutingConfigContext.Provider>;
}

export function useRoutingConfig(): RoutingConfig {
  return useContext(RoutingConfigContext);
}
