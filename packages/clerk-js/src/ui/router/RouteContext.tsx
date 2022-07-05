import type { ParsedQs } from 'qs';
import React from 'react';

export interface RouteContextValue {
  basePath: string;
  startPath: string;
  fullPath: string;
  indexPath: string;
  currentPath: string;
  matches: (path?: string, index?: boolean) => boolean;
  baseNavigate: (toURL: URL) => Promise<unknown>;
  navigate: (to: string) => Promise<unknown>;
  resolve: (to: string) => URL;
  refresh: () => void;
  params: { [key: string]: string };
  queryString: string;
  queryParams: ParsedQs;
  preservedParams?: string[];
  getMatchData: (path?: string, index?: boolean) => false | object;
}

export const RouteContext = React.createContext<RouteContextValue | null>(null);

RouteContext.displayName = 'RouteContext';

export const useRouter = (): RouteContextValue => {
  const ctx = React.useContext(RouteContext);
  if (!ctx) {
    throw new Error('useRouter called while Router is null');
  }
  return ctx;
};
