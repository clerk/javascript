'use client';

import { logger } from '@clerk/shared/logger';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { RoutingMode } from './use-mosaic-location';
import { markSettled } from './window-location';

export type ModalRoutingMode = Exclude<RoutingMode, 'path'>;

/**
 * What a host hands Mosaic so the URL modes read and write the host router's location instead of
 * `window`. It is a plain object the host writes from their own framework's hooks, so no framework
 * is a dependency of Mosaic. Every member is optional, and a missing one falls back to `window` on
 * its own. The pathname comes back as the address bar has it, percent-encoded, because Mosaic
 * splits it before it decodes it; the query string is the host's and its values are read decoded.
 */
export interface RouterAdapter {
  /**
   * A hook returning the current pathname, percent-encoded, as `location.pathname` does. `null` or
   * `undefined` means it cannot be read here, as from Next's Pages Router before it is ready, and
   * that read falls back to `window`.
   */
  usePathname?: () => string | null | undefined;
  /**
   * A hook returning the current query string, as a string with or without the leading `?` or as
   * `URLSearchParams`. `null` or `undefined` means it cannot be read here, and that read falls back
   * to `window`.
   */
  useSearchParams?: () => string | URLSearchParams | null | undefined;
  /**
   * A hook returning the current hash, percent-encoded, as `location.hash` does. A leading `#` is
   * optional. Its value is used only once the page has hydrated, since a server has no hash.
   */
  useHash?: () => string;
  /**
   * Navigates the host router to a URL made of a pathname, query string and hash, adding a history entry.
   *
   * Not providing this makes the push go through `history.pushState`, which is sometimes desirable
   * even if your framework has its own push, for example for Next where this is the mechanism to do
   * a shallow navigation rather than one that hits the server.
   */
  push?: (url: string) => void;
  /** As `push`, replacing the current history entry. */
  replace?: (url: string) => void;
  /**
   * Reads the host router's current location, for a write to start from. Without it a write starts
   * from `window.location`, which is right for every router whose location is the address bar.
   * Provide it, with `push` and `replace`, for a router whose location is not, such as a memory
   * router. It is a plain function, not a hook: it is called when a write happens, so it has to be
   * synchronous, as current as the hooks, and spelled the way `push` expects. A leading `?` on
   * `search` and `#` on `hash` are optional.
   */
  readUrl?: () => { pathname: string; search: string; hash: string };
}

export interface RoutingOptions {
  /**
   * The host router's location and navigation. Without it, the URL modes read and write
   * `window.location`. It is taken whole from the first render under the provider, so build the
   * adapter once, outside render.
   */
  adapter?: RouterAdapter;
  /**
   * What the names of the params Mosaic keeps in the query string or the hash start with. A
   * component's param is this prefix and its base with dots for slashes, `.user` for `/user` and
   * `.modal.user` for the profile modal, so a leading dot keeps them apart from the host's params.
   *
   * For example, providing `query: 'prefix'` would make `/user` be represented by `?prefix.user`.
   *
   * @default { query: '', hash: '' }
   */
  keyPrefix?: { query?: string; hash?: string };
  /**
   * Where Mosaic's own modals keep their segment: in memory, or in the hash or the query string, so a
   * modal survives a reload and Back closes it. In every mode a modal closes when the host moves to
   * another pathname. Changing it needs the provider remounted.
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
  has: Record<keyof AdapterReads, boolean>;
  push: RouterAdapter['push'];
  replace: RouterAdapter['replace'];
  readUrl: RouterAdapter['readUrl'];
  queryPrefix: string;
  hashPrefix: string;
  modals: ModalRoutingMode | undefined;
}

const defaultConfig: RoutingConfig = {
  reads: { usePathname: useNothing, useSearchParams: useNothing, useHash: useNothing },
  has: { usePathname: false, useSearchParams: false, useHash: false },
  push: undefined,
  replace: undefined,
  readUrl: undefined,
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

function hasOf(adapter: RouterAdapter | undefined): Record<keyof AdapterReads, boolean> {
  return {
    usePathname: adapter?.usePathname !== undefined,
    useSearchParams: adapter?.useSearchParams !== undefined,
    useHash: adapter?.useHash !== undefined,
  };
}

function shapeOf(adapter: RouterAdapter | undefined): string {
  return Object.values(hasOf(adapter))
    .map(has => (has ? '1' : '0'))
    .join('');
}

// The adapter is taken from the first render: its hooks have to be, because the components under the
// provider call them in their own hook order, and its functions follow the same rule so that nothing
// under the provider has to track a changing adapter.
export function RoutingConfigProvider({
  adapter,
  keyPrefix,
  modals,
  children,
}: RoutingOptions & { children: ReactNode }) {
  const [{ reads, has, shape, push, replace, readUrl }] = useState(() => ({
    reads: readsOf(adapter),
    has: hasOf(adapter),
    shape: shapeOf(adapter),
    push: adapter?.push,
    replace: adapter?.replace,
    readUrl: adapter?.readUrl,
  }));
  if (shapeOf(adapter) !== shape) {
    logger.warnOnce(
      '[Clerk] The routing adapter changed which hooks it has after the first render, so the first adapter stays in use. Build the adapter once, outside render.',
    );
  }
  useEffect(() => {
    queueMicrotask(markSettled);
  }, []);
  const queryPrefix = keyPrefix?.query ?? defaultConfig.queryPrefix;
  const hashPrefix = keyPrefix?.hash ?? defaultConfig.hashPrefix;
  const value = useMemo(
    () => ({
      reads,
      has,
      push,
      replace,
      readUrl,
      queryPrefix,
      hashPrefix,
      modals,
    }),
    [reads, has, push, replace, readUrl, queryPrefix, hashPrefix, modals],
  );
  return <RoutingConfigContext.Provider value={value}>{children}</RoutingConfigContext.Provider>;
}

export function useRoutingConfig(): RoutingConfig {
  return useContext(RoutingConfigContext);
}
