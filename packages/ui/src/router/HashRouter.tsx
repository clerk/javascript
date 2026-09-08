import { hasUrlInFragment, stripOrigin } from '@clerk/shared/internal/clerk-js/url';
import type { NavigateOptions } from '@clerk/shared/types';
import React from 'react';

import type { RefreshEvent } from './BaseRouter';
import { BaseRouter } from './BaseRouter';

export const hashRouterBase = 'CLERK-ROUTER/HASH';

const HASH_REFRESH_EVENTS: RefreshEvent[] = ['pushstate', 'replacestate', 'popstate', 'hashchange'];

interface HashRouterProps {
  preservedParams?: string[];
  children: React.ReactNode;
}

export const HashRouter = ({ preservedParams, children }: HashRouterProps): JSX.Element => {
  const internalNavigate = async (toURL: URL, options?: NavigateOptions): Promise<void> => {
    if (!toURL) {
      return;
    }
    const hash = stripOrigin(toURL).substring(1 + hashRouterBase.length);
    if (options?.replace) {
      window.location.replace('#' + hash);
    } else {
      window.location.hash = hash;
    }
    return Promise.resolve();
  };

  const fakeUrl = (): URL => {
    // Create a URL object with the contents of the hash
    // Use the origin because you can't create a url object without protocol and host
    if (hasUrlInFragment(window.location.hash)) {
      return new URL(window.location.origin + window.location.hash.substring(1));
    } else {
      return new URL(window.location.origin);
    }
  };

  const getPath = (): string => {
    return fakeUrl().pathname === '/' ? '/' + hashRouterBase : '/' + hashRouterBase + fakeUrl().pathname;
  };

  const getQueryString = (): string => {
    return fakeUrl().search;
  };

  return (
    <BaseRouter
      getPath={getPath}
      basePath={hashRouterBase}
      startPath={''}
      getQueryString={getQueryString}
      internalNavigate={internalNavigate}
      refreshEvents={HASH_REFRESH_EVENTS}
      preservedParams={preservedParams}
    >
      {children}
    </BaseRouter>
  );
};
