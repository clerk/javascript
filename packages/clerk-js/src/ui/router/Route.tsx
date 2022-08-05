import React from 'react';

import { trimTrailingSlash } from '../../utils';
import { newPaths } from './newPaths';
import { match } from './pathToRegexp';
import { RouteContext, useRouter } from './RouteContext';

interface RouteGuardProps {
  canActivate: () => boolean;
  fallbackPath: string;
}

interface UnguardedRouteProps {
  path?: string;
  index?: boolean;
  canActivate?: never;
  fallbackPath?: never;
}
type GuardedRouteProps = {
  path?: string;
  index?: boolean;
} & RouteGuardProps;

export type RouteProps = React.PropsWithChildren<UnguardedRouteProps | GuardedRouteProps>;

const RouteGuard = ({
  canActivate,
  fallbackPath,
  children,
}: React.PropsWithChildren<RouteGuardProps>): JSX.Element | null => {
  const router = useRouter();
  React.useEffect(() => {
    if (!canActivate()) {
      void router.navigate(fallbackPath);
    }
  });
  if (canActivate()) {
    return <>{children}</>;
  }
  return null;
};

export function Route(props: RouteProps): JSX.Element | null {
  const router = useRouter();

  if (!props.children) {
    return null;
  }

  if (!props.index && !props.path) {
    return <>{props.children}</>;
  }

  if (!router.matches(props.path, props.index)) {
    return null;
  }

  const [indexPath, fullPath] = newPaths(router.indexPath, router.fullPath, props.path, props.index);

  const resolve = (to: string) => {
    const url = new URL(to, window.location.origin + fullPath + '/');
    url.pathname = trimTrailingSlash(url.pathname);
    return url;
  };

  const newGetMatchData = (path?: string, index?: boolean) => {
    const [newIndexPath, newFullPath] = newPaths(indexPath, fullPath, path, index);
    const currentPath = trimTrailingSlash(router.currentPath);
    const matchResult =
      (path && match(newFullPath + '/:foo*')(currentPath)) ||
      (index && match(newIndexPath)(currentPath)) ||
      (index && match(newFullPath)(currentPath)) ||
      false;
    if (matchResult !== false) {
      return matchResult.params;
    } else {
      return false;
    }
  };

  const rawParams = router.getMatchData(props.path, props.index) || {};
  const paramsDict: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawParams)) {
    paramsDict[key] = value;
  }

  return (
    <RouteContext.Provider
      value={{
        basePath: router.basePath,
        startPath: router.startPath,
        indexPath: indexPath,
        fullPath: fullPath,
        currentPath: router.currentPath,
        queryParams: router.queryParams,
        queryString: router.queryString,
        baseNavigate: router.baseNavigate,
        getMatchData: newGetMatchData,
        matches: (path?: string, index?: boolean) => {
          return newGetMatchData(path, index) ? true : false;
        },
        resolve: resolve,
        navigate: (to: string) => {
          const toURL = resolve(to);
          return router.baseNavigate(toURL);
        },
        refresh: router.refresh,
        params: paramsDict,
      }}
    >
      {props.canActivate ? (
        <RouteGuard
          canActivate={props.canActivate}
          fallbackPath={props.fallbackPath}
        >
          {props.children}
        </RouteGuard>
      ) : (
        props.children
      )}
    </RouteContext.Provider>
  );
}
