import { useClerk } from '@clerk/shared/react';
import React, { useEffect } from 'react';

import { useClerkModalStateParams } from '../hooks';
import { BaseRouter } from './BaseRouter';
export const VIRTUAL_ROUTER_BASE_PATH = 'CLERK-ROUTER/VIRTUAL';

interface VirtualRouterProps {
  startPath: string;
  preservedParams?: string[];
  onExternalNavigate?: () => void;
  children: React.ReactNode;
}

export const VirtualRouter = ({
  startPath,
  preservedParams,
  onExternalNavigate,
  children,
}: VirtualRouterProps): JSX.Element => {
  const { __internal_addNavigationListener } = useClerk();
  const [currentURL, setCurrentURL] = React.useState(
    new URL('/' + VIRTUAL_ROUTER_BASE_PATH + startPath, window.location.origin),
  );
  const { urlStateParam, removeQueryParam } = useClerkModalStateParams();

  useEffect(() => {
    let unsubscribe = () => {};
    if (onExternalNavigate) {
      unsubscribe = __internal_addNavigationListener(onExternalNavigate);
    }
    return () => {
      unsubscribe();
    };
    // We are not expecting `onExternalNavigate` to change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (urlStateParam.componentName) {
    removeQueryParam();
  }

  const internalNavigate = (toURL: URL | undefined) => {
    if (!toURL) {
      return;
    }
    setCurrentURL(toURL);
  };

  const getPath = () => currentURL.pathname;

  const getQueryString = () => currentURL.search;

  return (
    <BaseRouter
      getPath={getPath}
      basePath={VIRTUAL_ROUTER_BASE_PATH}
      startPath={startPath}
      getQueryString={getQueryString}
      internalNavigate={internalNavigate}
      preservedParams={preservedParams}
      urlStateParam={urlStateParam}
    >
      {children}
    </BaseRouter>
  );
};
