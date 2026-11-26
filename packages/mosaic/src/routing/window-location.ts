import { logger } from '@clerk/shared/logger';
import { useSyncExternalStore } from 'react';

export interface HostUrl {
  pathname: string;
  // The query string and the hash, without their leading `?` and `#`.
  search: string;
  hash: string;
}

// We don't want to do window writes until the host router has had time to settle/patch
// history if it needs to, so we park them until then
// We assume writes through a router already handles this
let settled = false;
const parked: Array<() => void> = [];

type Listener = () => void;
const listeners = new Set<Listener>();

// Without a window, as on a server or in a native app, the store has nothing to subscribe to, read
// or write, and every function here says so instead of throwing. Virtual mode then works on its
// own; a URL mode needs an adapter that is the location.
const hasWindow = () => typeof window !== 'undefined';

// A host router's own `pushState` fires neither `popstate` nor `hashchange`, so where the browser
// has the Navigation API its `currententrychange` is listened to as well; it fires for every
// same-document navigation, whoever made it. It fires synchronously inside the `pushState` call,
// which a host router may make from an insertion effect, where React allows no update, so the
// store is told a microtask later.
function subscribe(listener: Listener): () => void {
  if (!hasWindow()) {
    return () => {};
  }
  const later = () => queueMicrotask(listener);
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  window.navigation?.addEventListener('currententrychange', later);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
    window.navigation?.removeEventListener('currententrychange', later);
  };
}

function subscribeToNothing(): () => void {
  return () => {};
}

function readNothing(): undefined {
  return undefined;
}

// The same object for as long as the URL is unchanged, as useSyncExternalStore requires
// Do not see this as a store or as state syncing, we always read directly from window.location,
// just in memoized form
let memoizedUrl: { href: string; url: HostUrl } | undefined;
export function readWindowUrl(): HostUrl | undefined {
  if (!hasWindow()) {
    return undefined;
  }
  const { href, pathname, search, hash } = window.location;
  if (memoizedUrl?.href !== href) {
    memoizedUrl = { href, url: { pathname, search: search.slice(1), hash: hash.slice(1) } };
  }
  return memoizedUrl.url;
}

// Disabled, it neither subscribes nor reads, so a component in virtual mode does not re-render on
// the page's navigations.
export function useWindowUrl(enabled: boolean): HostUrl | undefined {
  return useSyncExternalStore(
    enabled ? subscribe : subscribeToNothing,
    enabled ? readWindowUrl : readNothing,
    readNothing,
  );
}

export function notifyWindowUrl(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function markSettled(): void {
  settled = true;
  for (const write of parked.splice(0)) {
    write();
  }
}

export function isSameOrigin(url: string): boolean {
  if (!hasWindow()) {
    return true;
  }
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function writeWindowUrl(target: string | (() => string | undefined), replace: boolean): void {
  if (!hasWindow()) {
    return;
  }
  const write = () => {
    const url = typeof target === 'string' ? target : target();
    if (url === undefined) {
      return;
    }
    if (!isSameOrigin(url)) {
      logger.warnOnce(
        `[Clerk] "${url}" was not navigated to: it resolves to another origin, as a pathname that starts with "//" does. Serve the page at a pathname with a single leading slash.`,
      );
      return;
    }
    if (replace) {
      window.history.replaceState(null, '', url);
    } else {
      window.history.pushState(null, '', url);
    }
    // When we do the write we can notify immediately without the microtask gap
    notifyWindowUrl();
  };

  // See comment about settled/parked up top
  if (settled) {
    write();
  } else {
    parked.push(write);
  }
}
