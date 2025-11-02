import { hasUrlInFragment, mergeFragmentIntoUrl, stripOrigin } from '@clerk/shared/internal/clerk-js/url';
import { useClerk } from '@clerk/shared/react';
import type { NavigateOptions } from '@clerk/shared/types';
import React from 'react';

import { BaseRouter } from './BaseRouter';

interface PathRouterProps {
  basePath: string;
  preservedParams?: string[];
  children: React.ReactNode;
}

export const PathRouter = ({ basePath, preservedParams, children }: PathRouterProps): JSX.Element | null => {
  // Disabling is acceptable since this is a Router component
  // eslint-disable-next-line custom-rules/no-navigate-useClerk
  const { navigate } = useClerk();
  const [stripped, setStripped] = React.useState(false);

  if (!navigate) {
    throw new Error('Clerk: Missing navigate option.');
  }

  const internalNavigate = (toURL: URL | string | undefined, options?: NavigateOptions) => {
    if (!toURL) {
      return;
    }
    // Only send the path
    return navigate(stripOrigin(toURL), options);
  };

  const getPath = () => {
    return window.location.pathname;
  };

  const getQueryString = () => {
    return window.location.search;
  };

  React.useEffect(() => {
    const convertHashToPath = async () => {
      if (hasUrlInFragment(window.location.hash)) {
        const url = mergeFragmentIntoUrl(new URL(window.location.href));
        await internalNavigate(url.href, { replace: true });
        setStripped(true);
      }
    };
    void convertHashToPath();
  }, [setStripped, navigate, window.location.hash]);

  if (hasUrlInFragment(window.location.hash) && !stripped) {
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
