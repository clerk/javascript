import React from 'react';

import { stripOrigin, trimTrailingSlash } from '../../utils';
import { useCoreClerk } from '../contexts';
import { BaseRouter } from './BaseRouter';

interface PathRouterProps {
  basePath: string;
  preservedParams?: string[];
  children: React.ReactNode;
}

export const PathRouter = ({ basePath, preservedParams, children }: PathRouterProps): JSX.Element | null => {
  const { navigate } = useCoreClerk();
  const [stripped, setStripped] = React.useState(false);
  if (!navigate) {
    throw new Error('Clerk: Missing navigate option.');
  }

  const internalNavigate = (toURL: URL) => {
    // Only send the path
    return navigate(stripOrigin(toURL));
  };

  const getPath = () => {
    return window.location.pathname;
  };

  const getQueryString = () => {
    return window.location.search;
  };

  React.useEffect(() => {
    const effect = async () => {
      if (window.location.hash.startsWith('#/')) {
        const hashToPath = new URL(window.location.pathname + window.location.hash.substr(1), window.location.href);
        hashToPath.pathname = trimTrailingSlash(hashToPath.pathname);
        await navigate(stripOrigin(hashToPath));
        setStripped(true);
      }
    };
    void effect();
  }, [setStripped, navigate, window.location.hash]);

  if (window.location.hash.startsWith('#/') && !stripped) {
    return null;
  }

  return (
    <BaseRouter
      basePath={basePath.substring(1)}
      startPath={''}
      getPath={getPath}
      getQueryString={getQueryString}
      internalNavigate={internalNavigate}
      refreshEvents={['popstate']}
      preservedParams={preservedParams}
    >
      {children}
    </BaseRouter>
  );
};
