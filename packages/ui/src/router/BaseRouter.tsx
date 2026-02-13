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

// Custom events that don't exist on WindowEventMap but are handled
// by wrapping history.pushState/replaceState in the fallback path.
type HistoryEvent = 'pushstate' | 'replacestate';
type RefreshEvent = keyof WindowEventMap | HistoryEvent;
type NavigationType = 'push' | 'replace' | 'traverse';

const isWindowRefreshEvent = (event: RefreshEvent): event is keyof WindowEventMap => {
  return event !== 'pushstate' && event !== 'replacestate';
};

// Maps refresh events to Navigation API navigationType values.
const eventToNavigationType: Partial<Record<RefreshEvent, NavigationType>> = {
  popstate: 'traverse',
  pushstate: 'push',
  replacestate: 'replace',
};

// Global subscription sets for the history monkey-patching fallback.
// Using a single patch with subscriber sets avoids conflicts when
// multiple BaseRouter instances mount simultaneously.
const pushStateSubscribers = new Set<() => void>();
const replaceStateSubscribers = new Set<() => void>();
let originalPushState: History['pushState'] | null = null;
let originalReplaceState: History['replaceState'] | null = null;

function ensurePushStatePatched(): void {
  if (originalPushState) {
    return;
  }
  originalPushState = history.pushState.bind(history);
  history.pushState = (...args: Parameters<History['pushState']>) => {
    originalPushState!(...args);
    pushStateSubscribers.forEach(fn => fn());
  };
}

function ensureReplaceStatePatched(): void {
  if (originalReplaceState) {
    return;
  }
  originalReplaceState = history.replaceState.bind(history);
  history.replaceState = (...args: Parameters<History['replaceState']>) => {
    originalReplaceState!(...args);
    replaceStateSubscribers.forEach(fn => fn());
  };
}

/**
 * Observes history changes so the router's internal state stays in sync
 * with the URL. Uses the Navigation API when available, falling back to
 * monkey-patching history.pushState/replaceState plus native window events.
 *
 * Note: `events` should be a stable array reference to avoid
 * re-subscribing on every render.
 */
function useHistoryChangeObserver(events: Array<RefreshEvent> | undefined, callback: () => void): void {
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    if (!events) {
      return;
    }

    const notify = () => callbackRef.current();
    const windowEvents = events.filter(isWindowRefreshEvent);
    const navigationTypes = events
      .map(e => eventToNavigationType[e])
      .filter((type): type is NavigationType => Boolean(type));

    const hasNavigationAPI =
      typeof window !== 'undefined' &&
      'navigation' in window &&
      typeof (window as any).navigation?.addEventListener === 'function';

    if (hasNavigationAPI) {
      const nav = (window as any).navigation;
      const allowedTypes = new Set(navigationTypes);
      const handler = (e: { navigationType: NavigationType }) => {
        if (allowedTypes.has(e.navigationType)) {
          Promise.resolve().then(notify);
        }
      };
      nav.addEventListener('currententrychange', handler);

      // Events without a navigationType mapping (e.g. hashchange) still
      // need native listeners even when the Navigation API is available.
      const unmappedEvents = windowEvents.filter(e => !eventToNavigationType[e]);
      unmappedEvents.forEach(e => window.addEventListener(e, notify));

      return () => {
        nav.removeEventListener('currententrychange', handler);
        unmappedEvents.forEach(e => window.removeEventListener(e, notify));
      };
    }

    // Fallback: use global subscriber sets for pushState/replaceState
    // so that multiple BaseRouter instances don't conflict.
    if (events.includes('pushstate')) {
      ensurePushStatePatched();
      pushStateSubscribers.add(notify);
    }
    if (events.includes('replacestate')) {
      ensureReplaceStatePatched();
      replaceStateSubscribers.add(notify);
    }

    windowEvents.forEach(e => window.addEventListener(e, notify));

    return () => {
      pushStateSubscribers.delete(notify);
      replaceStateSubscribers.delete(notify);
      windowEvents.forEach(e => window.removeEventListener(e, notify));
    };
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
