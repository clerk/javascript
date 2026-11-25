import { logger } from '@clerk/shared/logger';
import { useMemo, useState } from 'react';

import type { MosaicLocation } from './location';
import type { AdapterRead, AdapterReads, RouterAdapter } from './router-adapter';
import { useRoutingConfig } from './router-adapter';
import type { UrlRoutingMode } from './url-location';
import { createSegmentCodec, urlWith, urlWithout } from './url-location';
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

function useAdapterRead(useRead: AdapterRead, leading: string): string | undefined {
  const value = useRead() ?? undefined;
  const text = typeof value === 'object' ? value.toString() : value;
  return text?.startsWith(leading) ? text.slice(leading.length) : text;
}

type Via = ((url: string) => void) | undefined;
type ReadUrl = RouterAdapter['readUrl'];

function hostUrlOf({ pathname, search, hash }: ReturnType<NonNullable<ReadUrl>>): HostUrl {
  return {
    pathname,
    search: search.startsWith('?') ? search.slice(1) : search,
    hash: hash.startsWith('#') ? hash.slice(1) : hash,
  };
}

const release = () => {};

// A write composes from where it lands, plus our change. Without `push` and `replace` it lands in
// `history`, so it starts from the address bar; a parked write starts from the address bar as it is
// when it lands. Through `push` or `replace` it starts from the router's own location when the
// adapter has `readUrl`, which a memory router needs, and from the address bar otherwise, since every
// other router's location is the address bar. It never starts from the adapter's hooks as this
// component last rendered them: the address bar is updated before or in the same commit as the
// tree, so it is never behind the host, and the hooks already tell the route what the host has
// committed, which is a render concern, not a write concern. That is also what lets each mode call
// only the adapter hook for the field it owns; reading all three to compose a write would make hash
// and path mode call Next's `useSearchParams`, and its Suspense requirement, for a field they never
// use.
function navigateTo(build: (from: HostUrl) => string | undefined, replace: boolean, via: Via, readUrl: ReadUrl): void {
  if (via === undefined) {
    writeWindowUrl(() => {
      const from = readWindowUrl();
      return from === undefined ? undefined : build(from);
    }, replace);
    return;
  }
  const from = readUrl === undefined ? readWindowUrl() : hostUrlOf(readUrl());
  const url = from === undefined ? undefined : build(from);
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
  const { reads, push, replace, readUrl, queryPrefix, hashPrefix } = useRoutingConfig();
  const fromWindow = useWindowUrl(true);
  const codec = useMemo(
    () => createSegmentCodec(routing, path, { query: queryPrefix, hash: hashPrefix }),
    [routing, path, queryPrefix, hashPrefix],
  );
  // We already lock this in RoutingConfigProvider to avoid conditional hooks, so this could
  // technically be removed, but keeping it to be very explicit about preventing conditional hooks
  const [useAdapterField] = useState(() => {
    const useRead = reads[ADAPTER_READS[codec.field]];
    return () => useAdapterRead(useRead, LEADING[codec.field]);
  });
  const fromAdapter = useAdapterField();
  const value =
    codec.field === 'hash' && fromWindow === undefined ? undefined : (fromAdapter ?? fromWindow?.[codec.field]);
  const raw = value === undefined ? undefined : codec.read(value);
  const parts = useMemo(() => (raw === undefined ? undefined : codec.decode(raw)), [codec, raw]);

  // A segment kept in the page's URL. The location holds nothing of its own: it hands out the parts
  // decoded from the host's URL for this render, and a write goes straight to the host as a full URL
  // built from the address bar. There are no owners to count, since the URL outlives a component by
  // itself, and clearing replaces, so closing a modal leaves no segment to go back to.
  return useMemo<MosaicLocation>(
    () => ({
      useSegmentParts: () => parts,
      write: (next, { replace: shouldReplace = false } = {}) => {
        navigateTo(from => urlWith(codec, from, next), shouldReplace, shouldReplace ? replace : push, readUrl);
      },
      clear: () => {
        navigateTo(from => urlWithout(codec, from), true, replace, readUrl);
      },
      own: () => release,
    }),
    [codec, parts, push, replace, readUrl],
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
  const [useLocation] = useState(() =>
    mode === 'virtual' ? useVirtualModeLocation : (path: string) => useUrlModeLocation(mode, path),
  );
  return useLocation(path);
}
