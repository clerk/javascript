import { useSyncExternalStore } from 'react';

// The page's URL as `window` holds it, for the URL modes when the host's adapter does not supply a
// read. It is one store for the whole page: it learns about the browser's own navigations from
// `popstate` and `hashchange`, and about Mosaic's from the writes below, which notify as soon as
// history has changed. A host router's own `pushState` reaches it only through an adapter. The
// server has no window, so its snapshot is undefined and a URL-mode component renders its root.
export interface HostUrl {
  pathname: string;
  // The query string and the hash, without their leading `?` and `#`.
  search: string;
  hash: string;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let cached: { href: string; url: HostUrl } | undefined;

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
  };
}

function subscribeToNothing(): () => void {
  return () => {};
}

function readNothing(): undefined {
  return undefined;
}

// The same object for as long as the URL is unchanged, as useSyncExternalStore requires.
export function readWindowUrl(): HostUrl {
  const { href, pathname, search, hash } = window.location;
  if (cached?.href !== href) {
    cached = { href, url: { pathname, search: search.slice(1), hash: hash.slice(1) } };
  }
  return cached.url;
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

// The Next.js App Router patches `pushState` and `replaceState`, and takes a state that carries its
// marker for one of its own writes: it keeps the entry but does not move `usePathname` and
// `useSearchParams` to the new URL. A write of ours goes without the marker, so Next applies it and
// copies its own state back in. Everything else in the state goes along, so a host router that keeps
// its own data there still finds it.
export function withoutNextAppRouterMarker(state: unknown): unknown {
  if (typeof state !== 'object' || state === null || !('__NA' in state || '_N' in state)) {
    return state;
  }
  const copy: object = Object.assign(Array.isArray(state) ? [] : {}, state);
  Reflect.deleteProperty(copy, '__NA');
  Reflect.deleteProperty(copy, '_N');
  return copy;
}

export function writeWindowUrl(url: string, replace: boolean): void {
  const state = withoutNextAppRouterMarker(window.history.state);
  if (replace) {
    window.history.replaceState(state, '', url);
  } else {
    window.history.pushState(state, '', url);
  }
  notifyWindowUrl();
}
