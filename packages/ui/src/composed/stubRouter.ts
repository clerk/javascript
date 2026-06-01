import type { RouteContextValue } from '../router/RouteContext';

export function createComposedRouter(clerkNavigate: (to: string) => Promise<unknown> | void): RouteContextValue {
  return {
    basePath: '',
    startPath: '',
    flowStartPath: '',
    fullPath: '',
    indexPath: '',
    currentPath: '',
    matches: () => false,
    navigate: async (to: string) => {
      await clerkNavigate(to);
    },
    baseNavigate: async (toURL: URL) => {
      await clerkNavigate(toURL.href);
    },
    resolve: (to: string) => new URL(to, window.location.href),
    refresh: () => {},
    params: {},
    queryString: '',
    queryParams: {},
    getMatchData: () => false,
  };
}

export const stubRouter: RouteContextValue = createComposedRouter(to => {
  window.location.assign(to);
  return Promise.resolve();
});
