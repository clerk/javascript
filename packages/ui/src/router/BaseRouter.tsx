import { getQueryParams, stringifyQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import { trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { NavigateOptions } from '@clerk/shared/types';
import React from 'react';
import { flushSync } from 'react-dom';

import { useWindowEventListener } from '../hooks';
import { newPaths } from './newPaths';
import { match } from './pathToRegexp';
import { Route } from './Route';
import { RouteContext } from './RouteContext';

interface BaseRouterProps {
  basePath: string;
  startPath: string;
  getPath: () => string;
  getQueryString: () => string;
  internalNavigate: (toURL: URL, options?: NavigateOptions) => Promise<any> | any;
  refreshEvents?: Array<keyof WindowEventMap>;
  preservedParams?: string[];
  urlStateParam?: {
    startPath: string;
    path: string;
    componentName: string;
    clearUrlStateParam: () => void;
    socialProvider: string;
  };
  children: React.ReactNode;
}

export const BaseRouter = ({
  basePath,
  startPath,
  getPath,
  getQueryString,
  internalNavigate,
  refreshEvents,
  preservedParams,
  urlStateParam,
  children,
}: BaseRouterProps): JSX.Element => {
  // Disabling is acceptable since this is a Router component
  // eslint-disable-next-line custom-rules/no-navigate-useClerk
  const { navigate: clerkNavigate } = useClerk();

  const [routeParts, setRouteParts] = React.useState({
    path: getPath(),
    queryString: getQueryString(),
  });
  const currentPath = routeParts.path;
  const currentQueryString = routeParts.queryString;
  const currentQueryParams = getQueryParams(routeParts.queryString);

  const resolve = (to: string): URL => {
    return new URL(to, window.location.origin);
  };

  const getMatchData = (path?: string, index?: boolean) => {
    const [newIndexPath, newFullPath] = newPaths('', '', path, index);
    const currentPathWithoutSlash = trimTrailingSlash(currentPath);

    const matchResult =
      (path && match(newFullPath + '/:foo*')(currentPathWithoutSlash)) ||
      (index && match(newIndexPath)(currentPathWithoutSlash)) ||
      (index && match(newFullPath)(currentPathWithoutSlash)) ||
      false;
    if (matchResult !== false) {
      return matchResult.params;
    } else {
      return false;
    }
  };

  const matches = (path?: string, index?: boolean): boolean => {
    return !!getMatchData(path, index);
  };

  const refresh = React.useCallback((): void => {
    const newPath = getPath();
    const newQueryString = getQueryString();

    if (newPath !== currentPath || newQueryString !== currentQueryString) {
      setRouteParts({
        path: newPath,
        queryString: newQueryString,
      });
    }
  }, [currentPath, currentQueryString, getPath, getQueryString]);

  useWindowEventListener(refreshEvents, refresh);

  // TODO: Look into the real possible types of globalNavigate
  const baseNavigate = async (toURL: URL | undefined): Promise<unknown> => {
    if (!toURL) {
      return;
    }

    const isCrossOrigin = toURL.origin !== window.location.origin;
    const isOutsideOfUIComponent = !toURL.pathname.startsWith('/' + basePath);

    if (isOutsideOfUIComponent || isCrossOrigin) {
      const res = await clerkNavigate(toURL.href);
      // TODO: Since we are closing the modal, why do we need to refresh ? wouldn't that unmount everything causing the state to refresh ?
      refresh();
      return res;
    }

    // For internal navigation, preserve any query params
    // that are marked to be preserved
    if (preservedParams) {
      const toQueryParams = getQueryParams(toURL.search);
      preservedParams.forEach(param => {
        if (!toQueryParams[param] && currentQueryParams[param]) {
          toQueryParams[param] = currentQueryParams[param];
        }
      });

      toURL.search = stringifyQueryParams(toQueryParams);
    }
    const internalNavRes = await internalNavigate(toURL, { metadata: { navigationType: 'internal' } });
    flushSync(() => {
      setRouteParts({ path: toURL.pathname, queryString: toURL.search });
    });
    return internalNavRes;
  };

  return (
    <RouteContext.Provider
      value={{
        basePath: basePath,
        startPath: startPath,
        flowStartPath: startPath,
        fullPath: '',
        indexPath: '',
        currentPath: currentPath,
        queryString: currentQueryString,
        queryParams: currentQueryParams,
        getMatchData: getMatchData.bind(this),
        matches: matches.bind(this),
        baseNavigate: baseNavigate.bind(this),
        navigate: async () => {
          //
        },
        resolve: resolve.bind(this),
        refresh: refresh.bind(this),
        params: {},
        urlStateParam: urlStateParam,
      }}
    >
      <Route path={basePath}>{children}</Route>
    </RouteContext.Provider>
  );
};
