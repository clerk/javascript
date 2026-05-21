import type { RouteContextValue } from '../router/RouteContext';

const noop = () => {};
const noopAsync = () => Promise.resolve();

export const stubRouter: RouteContextValue = {
  basePath: '',
  startPath: '',
  flowStartPath: '',
  fullPath: '',
  indexPath: '',
  currentPath: '',
  matches: () => false,
  baseNavigate: noopAsync,
  navigate: noopAsync,
  resolve: (to: string) => new URL(to, window.location.origin),
  refresh: noop,
  params: {},
  queryString: '',
  queryParams: {},
  getMatchData: () => false,
};
