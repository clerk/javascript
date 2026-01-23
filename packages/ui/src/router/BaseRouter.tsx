import { getQueryParams, stringifyQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import { trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { NavigateOptions } from '@clerk/shared/types';
import { createDeferredPromise } from '@clerk/shared/utils';
import React from 'react';

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

  const pendingNavigationResolversRef = React.useRef<Array<() => void>>([]);

  const isTornDownRef = React.useRef(false);
  React.useEffect(() => {
    // Reset on mount or when re-activated (e.g., after Activity becomes visible again)
    isTornDownRef.current = false;
    return () => {
      isTornDownRef.current = true;
      // Resolve all pending navigations on cleanup to prevent hanging promises
      for (const resolve of pendingNavigationResolversRef.current) {
        resolve();
      }
      pendingNavigationResolversRef.current = [];
    };
  }, []);

  // Resolve all pending navigation promises after routeParts state has been committed.
  React.useEffect(() => {
    if (pendingNavigationResolversRef.current.length > 0) {
      for (const resolve of pendingNavigationResolversRef.current) {
        resolve();
      }
      pendingNavigationResolversRef.current = [];
    }
  }, [routeParts]);

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

    // Always update routeParts. This is safe because:
    // - If unmounted: setState is a no-op
    // - If Activity-hidden: state updates still work, ensuring correct state when visible again
    setRouteParts({ path: toURL.pathname, queryString: toURL.search });

    // If cleanup has run (unmounted or Activity-hidden), return without awaiting.
    // - If unmounted: no component exists to have stale state
    // - If Activity-hidden: children's effects are also cleaned up/inactive, so the original concern
    //   about setActive emitting and children seeing old navigation state doesn't apply so there is
    //   no need to await the promise
    if (isTornDownRef.current) {
      return internalNavRes;
    }

    // Component is fully active. Create a deferred promise that will resolve after the
    // state update commits. This guarantees the re-render happens before handing things
    // back to the caller, preventing issues where setActive might emit and children
    // re-render and act on/redirect because of stale navigation state.
    const { promise: navigationCommittedPromise, resolve: resolveNavigation } = createDeferredPromise();
    pendingNavigationResolversRef.current.push(resolveNavigation);
    await navigationCommittedPromise;

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
