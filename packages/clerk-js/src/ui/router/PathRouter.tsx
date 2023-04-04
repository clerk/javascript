import React from 'react';

import { mergeFragmentIntoUrl, stripOrigin } from '../../utils';
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

  const urlHasFragment = window.location.hash.startsWith('#/');
  React.useEffect(() => {
    const convertHashToPath = async () => {
      if (urlHasFragment) {
        const url = mergeFragmentIntoUrl(new URL(window.location.href));
        await internalNavigate(url.href);
        setStripped(true);
      }
    };
    void convertHashToPath();
  }, [setStripped, navigate, window.location.hash]);

  if (urlHasFragment && !stripped) {
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
