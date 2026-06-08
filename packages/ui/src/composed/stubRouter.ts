import type { RouteContextValue } from '../router/RouteContext';

const SSR_BASE = 'http://localhost/';

export function createComposedRouter(
  clerkNavigate: (to: string) => Promise<unknown> | void,
  currentPath: string = '',
): RouteContextValue {
  return {
    basePath: '',
    startPath: '',
    flowStartPath: '',
    fullPath: '',
    indexPath: '',
    currentPath,
    matches: () => false,
    navigate: async (to: string) => {
      await clerkNavigate(to);
    },
    baseNavigate: async (toURL: URL) => {
      await clerkNavigate(toURL.href);
    },
    resolve: (to: string) => new URL(to, typeof window !== 'undefined' ? window.location.href : SSR_BASE),
    refresh: () => {},
    params: {},
    queryString: '',
    queryParams: {},
    getMatchData: () => false,
  };
}

export const stubRouter: RouteContextValue = createComposedRouter(to => {
  if (typeof window !== 'undefined') {
    window.location.assign(to);
  }
  return Promise.resolve();
});
