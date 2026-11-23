import { useSyncExternalStore } from 'react';

// The page's URL as `window` holds it, for the URL modes when the host's adapter does not supply a
// read. It is one store for the whole page: it learns about the browser's own navigations from
// `popstate` and `hashchange`, about any same-document navigation from the Navigation API where
// the browser has it, and about Mosaic's from the writes below, which notify as soon as history
// has changed. Elsewhere a host router's own `pushState` reaches it only through an adapter. The
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

// A host router's own `pushState` fires neither `popstate` nor `hashchange`, so where the browser
// has the Navigation API its `currententrychange` is listened to as well; it fires for every
// same-document navigation, whoever made it. It fires synchronously inside the `pushState` call,
// which a host router may make from an insertion effect, where React allows no update, so the
// store is told a microtask later.
function subscribe(listener: Listener): () => void {
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

export function writeWindowUrl(url: string, replace: boolean): void {
  if (replace) {
    window.history.replaceState(null, '', url);
  } else {
    window.history.pushState(null, '', url);
  }
  notifyWindowUrl();
}
