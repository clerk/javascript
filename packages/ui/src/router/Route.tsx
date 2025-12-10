import { pathFromFullPath, trimTrailingSlash } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { LoadedClerk } from '@clerk/shared/types';
import React from 'react';

import { useNavigateToFlowStart } from '../hooks';
import { newPaths } from './newPaths';
import { match } from './pathToRegexp';
import { RouteContext, useRouter } from './RouteContext';

interface RouteGuardProps {
  canActivate: (clerk: LoadedClerk) => boolean;
}

interface UnguardedRouteProps {
  path?: string;
  index?: boolean;
  flowStart?: boolean;
  canActivate?: never;
}
type GuardedRouteProps = {
  path?: string;
  index?: boolean;
  flowStart?: boolean;
} & RouteGuardProps;

export type RouteProps = React.PropsWithChildren<UnguardedRouteProps | GuardedRouteProps>;

const RouteGuard = ({ canActivate, children }: React.PropsWithChildren<RouteGuardProps>): JSX.Element | null => {
  const { navigateToFlowStart } = useNavigateToFlowStart();
  const clerk = useClerk();

  React.useEffect(() => {
    if (!canActivate(clerk)) {
      void navigateToFlowStart();
    }
  });
  if (canActivate(clerk)) {
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

  const resolve = (to: string, { searchParams }: { searchParams?: URLSearchParams } = {}) => {
    const url = new URL(to, window.location.origin + fullPath + '/');
    if (searchParams) {
      url.search = searchParams.toString();
    }
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

  const flowStartPath =
    (props.flowStart
      ? //set it as the old full path (the previous step),
        //replacing the base path for navigateToFlowStart() to work as expected
        pathFromFullPath(router.fullPath).replace('/' + router.basePath, '')
      : router.flowStartPath) || router.startPath;

  return (
    <RouteContext.Provider
      value={{
        basePath: router.basePath,
        startPath: router.startPath,
        flowStartPath: flowStartPath,
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
        navigate: (to: string, { searchParams } = {}) => {
          const toURL = resolve(to, { searchParams });
          return router.baseNavigate(toURL);
        },
        refresh: router.refresh,
        params: paramsDict,
        urlStateParam: router.urlStateParam,
      }}
    >
      {props.canActivate ? <RouteGuard canActivate={props.canActivate}>{props.children}</RouteGuard> : props.children}
    </RouteContext.Provider>
  );
}
