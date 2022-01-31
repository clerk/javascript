import { BaseRouter } from './BaseRouter';
import React from 'react';

export const VIRTUAL_ROUTER_BASE_PATH = 'CLERK-ROUTER/VIRTUAL';

interface VirtualRouterProps {
  startPath: string;
  preservedParams?: string[];
  onExternalNavigate?: () => any;
  children: React.ReactNode;
}

export const VirtualRouter = ({
  startPath,
  preservedParams,
  onExternalNavigate,
  children,
}: VirtualRouterProps): JSX.Element => {
  const [currentURL, setCurrentURL] = React.useState(
    new URL('/' + VIRTUAL_ROUTER_BASE_PATH + startPath, window.location.origin),
  );

  const internalNavigate = (toURL: URL) => {
    setCurrentURL(toURL);
  };

  const getPath = () => currentURL.pathname;

  const getQueryString = () => currentURL.search;

  return (
    <BaseRouter
      getPath={getPath}
      basePath={VIRTUAL_ROUTER_BASE_PATH}
      getQueryString={getQueryString}
      internalNavigate={internalNavigate}
      onExternalNavigate={onExternalNavigate}
      preservedParams={preservedParams}
    >
      {children}
    </BaseRouter>
  );
};
