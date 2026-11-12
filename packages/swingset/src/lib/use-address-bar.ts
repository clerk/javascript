import { usePathname, useSearchParams } from 'next/navigation';
import { useSyncExternalStore } from 'react';

function subscribeToTraversal(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener('hashchange', onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener('hashchange', onChange);
  };
}

function readAddressBar(): string {
  const { pathname, search, hash } = window.location;
  return `${pathname}${search}${hash}`;
}

function readNothing(): undefined {
  return undefined;
}

/** The URL as the address bar shows it, re-read on every navigation the router or the browser makes. */
export function useAddressBar(): string | undefined {
  usePathname();
  useSearchParams();
  return useSyncExternalStore(subscribeToTraversal, readAddressBar, readNothing);
}
