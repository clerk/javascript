import { getQueryParams, stringifyQueryParams } from '@clerk/shared/internal/clerk-js/querystring';
import { trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { NavigateOptions } from '@clerk/shared/types';
import React from 'react';
import { flushSync } from 'react-dom';

import { newPaths } from './newPaths';
import { match } from './pathToRegexp';
import { Route } from './Route';
import { RouteContext } from './RouteContext';

const hasNavigationAPI =
  typeof window !== 'undefined' &&
  'navigation' in window &&
  typeof (window as any).navigation?.addEventListener === 'function';

// Custom events that don't exist on WindowEventMap but are handled
// by wrapping history.pushState/replaceState in the fallback path.
type HistoryEvent = 'pushstate' | 'replacestate';
type RefreshEvent = keyof WindowEventMap | HistoryEvent;

// Maps refresh events to Navigation API navigationType values.
const eventToNavigationType: Partial<Record<RefreshEvent, string>> = {
  popstate: 'traverse',
  pushstate: 'push',
  replacestate: 'replace',
};

/**
 * Observes history changes so the router's internal state stays in sync
 * with the URL.
 *
 * With the Navigation API, listens to `currententrychange` filtered to
 * the navigation types derived from the provided events.
 * Falls back to wrapping history.pushState/replaceState (when pushstate/
 * replacestate are in events) plus listening for the raw window events
 * (popstate, hashchange, etc.).
 */
function useHistoryChangeObserver(events: Array<RefreshEvent> | undefined, callback: () => void): void {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    if (!events) {
      return;
    }

    const notify = () => callbackRef.current();
    const cleanups: Array<() => void> = [];

    if (hasNavigationAPI) {
      const nav = (window as any).navigation;
      const allowedTypes = new Set(events.map(e => eventToNavigationType[e]).filter(Boolean));
      const handler = (e: { navigationType: string }) => {
        if (allowedTypes.has(e.navigationType)) {
          notify();
        }
      };
      nav.addEventListener('currententrychange', handler);
      return () => nav.removeEventListener('currententrychange', handler);
    }

    // Fallback: wrap pushState/replaceState for programmatic navigations
    // when the corresponding events are requested.
    if (events.includes('pushstate') || events.includes('replacestate')) {
      const origPushState = history.pushState.bind(history);
      const origReplaceState = history.replaceState.bind(history);

      if (events.includes('pushstate')) {
        history.pushState = (...args: Parameters<History['pushState']>) => {
          origPushState(...args);
          notify();
        };
      }
      if (events.includes('replacestate')) {
        history.replaceState = (...args: Parameters<History['replaceState']>) => {
          origReplaceState(...args);
          notify();
        };
      }

      cleanups.push(() => {
        history.pushState = origPushState;
        history.replaceState = origReplaceState;
      });
    }

    // Listen for native window events (popstate, hashchange, etc.).
    const windowEvents = events.filter((e): e is keyof WindowEventMap => e !== 'pushstate' && e !== 'replacestate');
    windowEvents.forEach(e => window.addEventListener(e, notify));
    cleanups.push(() => windowEvents.forEach(e => window.removeEventListener(e, notify)));

    return () => cleanups.forEach(fn => fn());
  }, [events]);
}

interface BaseRouterProps {
  basePath: string;
  startPath: string;
  getPath: () => string;
  getQueryString: () => string;
  internalNavigate: (toURL: URL, options?: NavigateOptions) => Promise<any> | any;
  refreshEvents?: Array<RefreshEvent>;
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

  useHistoryChangeObserver(refreshEvents, refresh);

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
    // We need to flushSync to guarantee the re-render happens before handing things back to the caller,
    // otherwise setActive might emit, and children re-render with the old navigation state.
    // An alternative solution here could be to return a deferred promise, set that to state together
    // with the routeParts and resolve it in an effect. That way we could avoid the flushSync performance penalty.
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
