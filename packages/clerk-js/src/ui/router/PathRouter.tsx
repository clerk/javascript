import React from 'react';

import { hasUrlInFragment, mergeFragmentIntoUrl, stripOrigin } from '../../utils';
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

  const internalNavigate = (toURL: URL | string | undefined) => {
    if (!toURL) {
      return;
    }
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
    const convertHashToPath = async () => {
      if (hasUrlInFragment(window.location.hash)) {
        const url = mergeFragmentIntoUrl(new URL(window.location.href));
        window.history.replaceState(window.history.state, '', url.href);
        await internalNavigate(url.href); // make this navigation as well since replaceState is asynchronous
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
      flowStartPath={''}
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
