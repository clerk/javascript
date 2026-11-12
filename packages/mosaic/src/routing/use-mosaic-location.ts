import { logger } from '@clerk/shared/logger';
import { useInsertionEffect, useMemo, useRef, useState } from 'react';

import type { MosaicLocation } from './location';
import { useRoutingConfig } from './router-adapter';
import type { UrlRoutingMode } from './url-location';
import { urlCarrier, urlWith, urlWithout } from './url-location';
import { createVirtualLocation } from './virtual-location';
import { useVirtualActions } from './virtual-store';
import type { HostUrl } from './window-location';
import { notifyWindowUrl, readWindowUrl, useWindowUrl, writeWindowUrl } from './window-location';

export type MosaicRoutingMode = 'virtual' | UrlRoutingMode;

export type MosaicLocationOptions = {
  routing: MosaicRoutingMode;
  path?: string;
  // In path mode, the pathname `clear` writes instead of the base; a modal names the page it
  // closes to. Nothing in the other modes.
  clearedPath?: string;
};

export interface RoutingProps {
  /**
   * Where the component's pages live: `virtual` keeps them in memory, `path` in the pathname under
   * `path`, `hash` and `query` in a param of the hash or the query string. Defaults per component.
   * Changing it needs a remount, so key the component on it.
   */
  routing?: MosaicLocationOptions['routing'];
  /** The base the component's pages are nested under. Defaults per component. */
  path?: string;
}

function readNothing(): undefined {
  return undefined;
}

// An adapter's hook, or nothing when it does not have that one. The provider fixes which hooks the
// adapter has, so the hooks this calls are fixed too.
function useAdapterRead(
  read: (() => string | URLSearchParams | null | undefined) | undefined,
  leading: string,
): string | undefined {
  const value = (read ?? readNothing)() ?? undefined;
  const text = typeof value === 'object' ? value.toString() : value;
  return text?.startsWith(leading) ? text.slice(leading.length) : text;
}

interface Committed {
  pathname: string | undefined;
  search: string | undefined;
  hash: string | undefined;
  push: ((url: string) => void) | undefined;
  replace: ((url: string) => void) | undefined;
}

const release = () => {};

// A write is built in the world of whoever performs it. Through the adapter's `push` or `replace`
// that is the adapter's reads, with `window` for the ones it lacks; without them it is `window`
// itself, which already has whatever a host adds around a pathname, such as a base path.
function startOf(last: Committed, replace: boolean): { via: ((url: string) => void) | undefined; url: HostUrl } {
  const via = replace ? last.replace : last.push;
  const live = readWindowUrl();
  if (via === undefined) {
    return { via, url: live };
  }
  return {
    via,
    url: { pathname: last.pathname ?? live.pathname, search: last.search ?? live.search, hash: last.hash ?? live.hash },
  };
}

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function navigateTo(url: string, replace: boolean, via: ((url: string) => void) | undefined): void {
  if (!isSameOrigin(url)) {
    logger.warnOnce(
      `[Clerk] "${url}" was not navigated to: it resolves to another origin, as a pathname that starts with "//" does. Serve the page at a pathname with a single leading slash.`,
    );
    return;
  }
  if (via) {
    via(url);
    notifyWindowUrl();
  } else {
    writeWindowUrl(url, replace);
  }
}

function urlModeLocationHook(mode: UrlRoutingMode) {
  return (path: string, clearedPath: string | undefined) => useUrlModeLocation(mode, path, clearedPath);
}

function useVirtualModeLocation(path: string, _clearedPath: string | undefined): MosaicLocation {
  const actions = useVirtualActions();
  return useMemo(() => createVirtualLocation(path, actions), [path, actions]);
}

// A read the adapter does not supply comes from `window`, at render through its store and at the
// moment of a write directly. The location is rebuilt only when its entry changes: a write reads the
// host as it was last committed, so a host that re-renders with a new adapter object or a new URL
// does not hand the components above a new location each time.
function useUrlModeLocation(routing: UrlRoutingMode, path: string, clearedPath: string | undefined): MosaicLocation {
  const { reads, push, replace, queryPrefix, hashPrefix } = useRoutingConfig();
  const fromWindow = useWindowUrl(true);
  const pathname = useAdapterRead(reads.usePathname, '');
  const search = useAdapterRead(reads.useSearchParams, '?');
  const hash = useAdapterRead(reads.useHash, '#');

  const carrier = useMemo(
    () => urlCarrier(routing, path, { query: queryPrefix, hash: hashPrefix }, clearedPath),
    [routing, path, queryPrefix, hashPrefix, clearedPath],
  );
  const rendered: Partial<HostUrl> = {
    pathname: pathname ?? fromWindow?.pathname,
    search: search ?? fromWindow?.search,
    hash: hash ?? fromWindow?.hash,
  };
  const value = rendered[carrier.field];
  const raw = value === undefined ? undefined : carrier.read(value);
  const parts = useMemo(() => (raw === undefined ? undefined : carrier.decode(raw)), [carrier, raw]);

  // Written in an insertion effect so that a write from any layout or passive effect of the same
  // commit, in this component or below it, already starts from this commit's host URL.
  const committed = useRef<Committed>({ pathname, search, hash, push, replace });
  useInsertionEffect(() => {
    committed.current = { pathname, search, hash, push, replace };
  });

  // A base's entry in the page's URL. It holds nothing of its own: it hands out the parts decoded
  // from the host's URL for this render, and a write goes straight to the host as a full URL. What
  // a write starts from is the host as it was last committed, and `window` for whatever the adapter
  // does not read; reading that only from a write is what lets the location stay the same object
  // while its entry is unchanged. There are no owners to count, since the URL outlives a component
  // by itself, and clearing replaces, so closing a modal leaves no entry to go back to.
  return useMemo<MosaicLocation>(
    () => ({
      useSegmentParts: () => parts,
      write: (next, { replace: shouldReplace = false } = {}) => {
        const start = startOf(committed.current, shouldReplace);
        const url = urlWith(carrier, start.url, next);
        if (url !== undefined) {
          navigateTo(url, shouldReplace, start.via);
        }
      },
      clear: () => {
        const start = startOf(committed.current, true);
        navigateTo(urlWithout(carrier, start.url), true, start.via);
      },
      own: () => release,
    }),
    [carrier, parts],
  );
}

// The mode is fixed on the first render: each mode calls its own hooks, so a component changes mode
// by remounting, which the profiles do by keying on `routing`.
export function useFixedRoutingMode(routing: MosaicRoutingMode): MosaicRoutingMode {
  const [mode] = useState(routing);
  if (mode !== routing) {
    logger.warnOnce(
      `[Clerk] "routing" changed from "${mode}" to "${routing}" without a remount, so it stays "${mode}". Key the component on its routing to change it.`,
    );
  }
  return mode;
}

export function useMosaicLocation({ routing, path = '/', clearedPath }: MosaicLocationOptions): MosaicLocation {
  const mode = useFixedRoutingMode(routing);
  const [useLocation] = useState(() => (mode === 'virtual' ? useVirtualModeLocation : urlModeLocationHook(mode)));
  return useLocation(path, clearedPath);
}
