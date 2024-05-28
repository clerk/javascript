import { useSyncExternalStore } from 'react';

import type { ClerkHostRouter } from './router';

const DUMMY_ORIGIN = 'https://clerk.dummy';

// TODO: introduce history stack?
class VirtualRouter implements ClerkHostRouter {
  #url: URL;
  #listeners: Set<(url: URL) => void> = new Set();

  constructor(path?: string) {
    const origin = typeof window === 'undefined' ? DUMMY_ORIGIN : window.location.origin;

    this.#url = new URL(path ?? '/', origin);
  }

  push(path: string) {
    const newUrl = new URL(this.#url.toString());
    newUrl.pathname = path;

    this.#url = newUrl;
    this.emit();
  }

  replace(path: string) {
    this.push(path);
  }

  shallowPush(path: string) {
    this.push(path);
  }

  pathname() {
    return this.#url.pathname;
  }

  searchParams() {
    return this.#url.searchParams;
  }

  subscribe(listener: () => void) {
    this.#listeners.add(listener);

    return () => this.#listeners.delete(listener);
  }

  emit() {
    this.#listeners.forEach(listener => listener(this.#url));
  }

  getSnapshot() {
    return this.#url;
  }
}

const virtualRouter = new VirtualRouter('/');

export const useVirtualRouter = (): ClerkHostRouter => {
  const url = useSyncExternalStore(
    virtualRouter.subscribe.bind(virtualRouter),
    virtualRouter.getSnapshot.bind(virtualRouter),
  );

  return {
    pathname: () => url.pathname,
    searchParams: () => url.searchParams,
    push: virtualRouter.push.bind(virtualRouter),
    replace: virtualRouter.replace.bind(virtualRouter),
    shallowPush: virtualRouter.shallowPush.bind(virtualRouter),
  };
};
