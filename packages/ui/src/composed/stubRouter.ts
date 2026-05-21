import type { RouteContextValue } from '../router/RouteContext';

const noop = () => {};

function isExternalUrl(to: string): boolean {
  try {
    return new URL(to).origin !== window.location.origin;
  } catch {
    return false;
  }
}

export const stubRouter: RouteContextValue = {
  basePath: '',
  startPath: '',
  flowStartPath: '',
  fullPath: '',
  indexPath: '',
  currentPath: '',
  matches: () => false,
  baseNavigate: async (toURL: URL) => {
    if (toURL.origin !== window.location.origin) {
      window.location.href = toURL.href;
    }
  },
  navigate: async (to: string) => {
    if (isExternalUrl(to)) {
      window.location.href = to;
    }
  },
  resolve: (to: string) => new URL(to, window.location.origin),
  refresh: noop,
  params: {},
  queryString: '',
  queryParams: {},
  getMatchData: () => false,
};
