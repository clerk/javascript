import { mergeFragmentIntoUrl } from '@clerk/shared/internal/clerk-js/url';

import type { MosaicLocation, WriteOptions } from './location';
import { splitQuery } from './match';
import { subscribeToUrlChanges } from './url-changes';

export type HostNavigate = (to: string, options: WriteOptions) => Promise<unknown>;

export interface PathLocation extends MosaicLocation {
  start: () => Promise<void>;
}

interface PathLocationOptions {
  basePath: string;
  navigate: HostNavigate;
}

export function createPathLocation({ basePath, navigate }: PathLocationOptions): PathLocation {
  const base = `/${basePath.split('/').filter(Boolean).join('/')}`.replace(/^\/$/, '');

  const basePrefix = `${base}/`;

  const isInBase = (pathname: string) => base === '' || pathname === base || pathname.startsWith(basePrefix);

  const hasFragmentPath = () => window.location.hash.startsWith('#/');

  const currentUrl = () => (hasFragmentPath() ? mergeFragmentIntoUrl(window.location.href) : window.location);

  const toHostPath = (to: string) => {
    const { path, search } = splitQuery(to);
    const pathname = path ? `${base}/${path}` : base || '/';
    return `${pathname}${search}`;
  };

  return {
    read: () => {
      if (typeof window === 'undefined') {
        return '';
      }
      const { pathname, search } = currentUrl();
      const path = isInBase(pathname) ? pathname.slice(base.length + 1) : '';
      return `${path}${search}`;
    },
    write: async (to, options) => {
      await navigate(toHostPath(to), options);
    },
    start: async () => {
      if (typeof window === 'undefined' || !hasFragmentPath()) {
        return;
      }
      const { pathname, search } = currentUrl();
      await navigate(`${pathname}${search}`, { replace: true });
    },
    subscribe: listener =>
      subscribeToUrlChanges(() => {
        if (isInBase(window.location.pathname)) {
          listener();
        }
      }),
  };
}
