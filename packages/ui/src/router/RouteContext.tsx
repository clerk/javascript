import React from 'react';

export interface RouteContextValue {
  basePath: string;
  startPath: string;
  flowStartPath: string;
  fullPath: string;
  indexPath: string;
  currentPath: string;
  matches: (path?: string, index?: boolean) => boolean;
  baseNavigate: (toURL: URL) => Promise<unknown>;
  navigate: (to: string, options?: { searchParams?: URLSearchParams }) => Promise<unknown>;
  resolve: (to: string) => URL;
  refresh: () => void;
  params: { [key: string]: string };
  queryString: string;
  queryParams: Record<string, string>;
  preservedParams?: string[];
  getMatchData: (path?: string, index?: boolean) => false | object;
  urlStateParam?: {
    startPath: string;
    path: string;
    componentName: string;
    clearUrlStateParam: () => void;
    socialProvider: string;
  };
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
