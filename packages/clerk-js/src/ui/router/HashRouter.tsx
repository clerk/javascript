import React from 'react';

import { stripOrigin } from '../../utils';
import { BaseRouter } from './BaseRouter';

export const hashRouterBase = 'CLERK-ROUTER/HASH';

interface HashRouterProps {
  preservedParams?: string[];
  children: React.ReactNode;
}

export const HashRouter = ({ preservedParams, children }: HashRouterProps): JSX.Element => {
  const internalNavigate = async (toURL: URL): Promise<void> => {
    if (!toURL) {
      return;
    }
    window.location.hash = stripOrigin(toURL).substring(1 + hashRouterBase.length);
    return Promise.resolve();
  };

  const fakeUrl = (): URL => {
    // Create a URL object with the contents of the hash
    // Use the origin because you can't create a url object without protocol and host
    if (window.location.hash.startsWith('#/')) {
      return new URL(window.location.origin + window.location.hash.substring(1));
    } else {
      return new URL(window.location.origin);
    }
  };

  const getPath = (): string => {
    return fakeUrl().pathname === '/' ? '/' + hashRouterBase : '/' + hashRouterBase + fakeUrl().pathname;
  };

  const getQueryString = (): string => {
    // Construct a search string that combines all search params of the current url
    // and all search params found within the fragment part of the current url, which is normally ignored.
    // The search params from the fragment need to be appending last, so they take priority over any other params,
    // so we can be sure that we introduce no changes to the existing behavior
    const tempUrl = new URL(window.location.href);
    const urlWithFragmentPart = fakeUrl();
    urlWithFragmentPart.searchParams.forEach((value, key) => tempUrl.searchParams.set(key, value));
    return tempUrl.search;
  };

  return (
    <BaseRouter
      getPath={getPath}
      basePath={hashRouterBase}
      startPath={''}
      getQueryString={getQueryString}
      internalNavigate={internalNavigate}
      refreshEvents={['popstate', 'hashchange']}
      preservedParams={preservedParams}
    >
      {children}
    </BaseRouter>
  );
};
