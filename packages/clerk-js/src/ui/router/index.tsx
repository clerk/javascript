export * from './RouteContext';
export * from './HashRouter';
export * from './PathRouter';
export * from './VirtualRouter';
export * from './Route';
export * from './Switch';

export type { ParsedQs } from 'qs';
export type ParsedQueryString = {
  [key: string]: undefined | string | string[] | ParsedQueryString | ParsedQueryString[];
};
