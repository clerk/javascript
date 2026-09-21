import { PRESERVED_QUERYSTRING_PARAMS } from '@clerk/shared/internal/clerk-js/constants';
import React from 'react';
import { flushSync } from 'react-dom';

import type { RouteTable } from './match';
import { createMemoryLocation } from './memory-location';
import { useMosaicLocation } from './MosaicRoutingProvider';
import { createRouter, type Router, type SearchParams } from './router';

export interface MosaicRoutes<Routes extends RouteTable> {
  route: Extract<keyof Routes, string> | undefined;
  params: Record<string, string>;
  search: SearchParams;
  go: Router<Routes>['go'];
}

export function useMosaicRoutes<const Routes extends RouteTable>(routes: Routes): MosaicRoutes<Routes> {
  const location = useMosaicLocation();
  const [router] = React.useState(() =>
    createRouter(routes, location ?? createMemoryLocation(), {
      commit: flushSync,
      preservedSearchParams: PRESERVED_QUERYSTRING_PARAMS,
    }),
  );
  const page = React.useSyncExternalStore(router.subscribe, router.get, router.get);

  return {
    route: page?.route,
    params: page?.params ?? {},
    search: page?.search ?? {},
    go: router.go,
  };
}
