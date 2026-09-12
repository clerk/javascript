import type { RouteContextValue } from '../router/RouteContext';

const SSR_BASE = 'http://localhost/';

// Composed sections render outside the AIO Route/Switch tree, so the stub
// router has no path-matching state. Calls into these APIs almost always mean
// someone added a <Route>, navigateToFlowStart(), or refresh() inside a
// composed section — fail loudly in dev so that's caught at the test level
// instead of silently rendering null.
function unsupported(api: string): never {
  throw new Error(
    `[@clerk/ui composed] router.${api} is not supported inside composed sections. ` +
      `Composed sections are leaf-only — <Route>, navigateToFlowStart(), router.refresh(), ` +
      `getMatchData() and urlStateParam are AIO-only. Move routing to the consumer.`,
  );
}

function maybeUnsupported<T>(api: string, prodValue: T): T {
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    unsupported(api);
  }
  return prodValue;
}

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
    matches: () => maybeUnsupported('matches()', false),
    navigate: async (to: string) => {
      await clerkNavigate(to);
    },
    baseNavigate: async (toURL: URL) => {
      await clerkNavigate(toURL.href);
    },
    resolve: (to: string) => new URL(to, typeof window !== 'undefined' ? window.location.href : SSR_BASE),
    refresh: () => maybeUnsupported('refresh()', undefined),
    params: {},
    queryString: '',
    queryParams: {},
    getMatchData: () => maybeUnsupported('getMatchData()', false),
  };
}

export const stubRouter: RouteContextValue = createComposedRouter(to => {
  if (typeof window !== 'undefined') {
    window.location.assign(to);
  }
  return Promise.resolve();
});
