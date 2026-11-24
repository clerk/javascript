import { logger } from '@clerk/shared/logger';
import { useInsertionEffect, useMemo, useRef, useState } from 'react';

import type { MosaicLocation } from './location';
import type { AdapterRead, AdapterReads } from './router-adapter';
import { useRoutingConfig } from './router-adapter';
import type { UrlRoutingMode } from './url-location';
import { urlCarrier, urlWith, urlWithout } from './url-location';
import { createVirtualLocation } from './virtual-location';
import { useVirtualActions } from './virtual-store';
import type { HostUrl } from './window-location';
import { isSameOrigin, notifyWindowUrl, readWindowUrl, useWindowUrl, writeWindowUrl } from './window-location';

export type RoutingMode = 'virtual' | UrlRoutingMode;

export type MosaicLocationOptions = {
  routing: RoutingMode;
  path?: string;
};

const ADAPTER_READS: Record<keyof HostUrl, keyof AdapterReads> = {
  pathname: 'usePathname',
  search: 'useSearchParams',
  hash: 'useHash',
};

const LEADING: Record<keyof HostUrl, string> = { pathname: '', search: '?', hash: '#' };

// The provider fixes which hooks the adapter has, so the hook this calls is fixed too.
function useAdapterRead(useRead: AdapterRead, leading: string): string | undefined {
  const value = useRead() ?? undefined;
  const text = typeof value === 'object' ? value.toString() : value;
  return text?.startsWith(leading) ? text.slice(leading.length) : text;
}

type Via = ((url: string) => void) | undefined;

const release = () => {};

// A write is "the URL in the address bar, plus our change", never "the URL the host last rendered,
// plus our change": the address bar is what the write lands on, and a host updates it before or in
// the same commit as the tree it renders for it, so it is never behind the host and may be ahead.
function navigateTo(build: (from: HostUrl) => string | undefined, replace: boolean, via: Via): void {
  if (via === undefined) {
    writeWindowUrl(() => build(readWindowUrl()), replace);
    return;
  }
  const url = build(readWindowUrl());
  if (url === undefined) {
    return;
  }
  if (!isSameOrigin(url)) {
    logger.warnOnce(
      `[Clerk] "${url}" was not navigated to: it resolves to another origin, as a pathname that starts with "//" does. Serve the page at a pathname with a single leading slash.`,
    );
    return;
  }
  via(url);
  notifyWindowUrl();
}

function urlModeLocationHook(mode: UrlRoutingMode) {
  return (path: string) => useUrlModeLocation(mode, path);
}

function useVirtualModeLocation(path: string): MosaicLocation {
  const actions = useVirtualActions();
  return useMemo(() => createVirtualLocation(path, actions), [path, actions]);
}

/**
 * Low level hook to read the pathname, should not be used directly by components.
 */
export function useHostPathname(): string | undefined {
  const { reads } = useRoutingConfig();
  const fromWindow = useWindowUrl(true);
  return useAdapterRead(reads.usePathname, '') ?? fromWindow?.pathname;
}

// Each mode renders from the one field of the URL it owns, read through the adapter when it has
// that hook so the route agrees with what the host has rendered, and from `window` otherwise. The
// other fields matter only to a write, which preserves them from the address bar.
function useUrlModeLocation(routing: UrlRoutingMode, path: string): MosaicLocation {
  const { reads, push, replace, queryPrefix, hashPrefix } = useRoutingConfig();
  const fromWindow = useWindowUrl(true);
  const carrier = useMemo(
    () => urlCarrier(routing, path, { query: queryPrefix, hash: hashPrefix }),
    [routing, path, queryPrefix, hashPrefix],
  );
  // We already lock this in RoutingConfigProvider to avoid conditional hooks, so this could
  // technically be removed, but keeping it to be very explicit about preventing conditional hooks
  const [useAdapterField] = useState(() => {
    const useRead = reads[ADAPTER_READS[carrier.field]];
    return () => useAdapterRead(useRead, LEADING[carrier.field]);
  });
  const fromAdapter = useAdapterField();
  const value =
    carrier.field === 'hash' && fromWindow === undefined ? undefined : (fromAdapter ?? fromWindow?.[carrier.field]);
  const raw = value === undefined ? undefined : carrier.read(value);
  const parts = useMemo(() => (raw === undefined ? undefined : carrier.decode(raw)), [carrier, raw]);

  const via = useRef({ push, replace });
  useInsertionEffect(() => {
    via.current = { push, replace };
  });

  // A base's entry in the page's URL. It holds nothing of its own: it hands out the parts decoded
  // from the host's URL for this render, and a write goes straight to the host as a full URL built
  // from the address bar. There are no owners to count, since the URL outlives a component by
  // itself, and clearing replaces, so closing a modal leaves no entry to go back to.
  return useMemo<MosaicLocation>(
    () => ({
      useSegmentParts: () => parts,
      write: (next, { replace: shouldReplace = false } = {}) => {
        navigateTo(
          from => urlWith(carrier, from, next),
          shouldReplace,
          shouldReplace ? via.current.replace : via.current.push,
        );
      },
      clear: () => {
        navigateTo(from => urlWithout(carrier, from), true, via.current.replace);
      },
      own: () => release,
    }),
    [carrier, parts],
  );
}

// The mode is fixed on the first render: each mode calls its own hooks, so a component changes mode
// by remounting, which the profiles do by keying on `routing`.
export function useFixedRoutingMode<Mode extends RoutingMode>(routing: Mode): Mode {
  const [mode] = useState(routing);
  if (mode !== routing) {
    logger.warnOnce(
      `[Clerk] "routing" changed from "${mode}" to "${routing}" without a remount, so it stays "${mode}". Key the component on its routing to change it.`,
    );
  }
  return mode;
}

export function useMosaicLocation({ routing, path = '/' }: MosaicLocationOptions): MosaicLocation {
  const mode = useFixedRoutingMode(routing);
  const [useLocation] = useState(() => (mode === 'virtual' ? useVirtualModeLocation : urlModeLocationHook(mode)));
  return useLocation(path);
}
