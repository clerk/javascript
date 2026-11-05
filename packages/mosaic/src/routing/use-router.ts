import { logger } from '@clerk/shared/logger';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { MosaicLocation, SegmentParts } from './location';
import type { Route, Router } from './router';
import { createRouter } from './router';
import type { RouteName, RouteTable } from './routes';
import { routeParts } from './routes';
import type { RoutingScope } from './routing-scope';
import { createRoutingScope, useInheritedScope } from './routing-scope';
import type { MosaicLocationOptions } from './use-mosaic-location';
import { useMosaicLocation } from './use-mosaic-location';

const EMPTY_PARAMS: Record<string, string> = Object.freeze({});

const KEY_SEPARATOR = '\u0000';

// Keeps the same value object for as long as its key is unchanged, so memoisation downstream holds
// across callers that build a new object every render. Setting state during render makes React
// restart the render with the new value when the key changes, which is the documented way to derive
// state from props.
function useStableByKey<Value>(value: Value, key: string): Value {
  const [stable, setStable] = useState({ key, value });
  if (stable.key !== key) {
    setStable({ key, value });
  }
  return stable.key === key ? stable.value : value;
}

function useStableTable<Routes extends RouteTable>(routes: Routes): Routes {
  return useStableByKey(routes, Object.entries(routes).flat().join(KEY_SEPARATOR));
}

function sameParts(a: SegmentParts, b: SegmentParts): boolean {
  return a.length === b.length && a.every((part, index) => part === b[index]);
}

function missingScope(): never {
  throw new Error('[clerk] useRouter needs a <MosaicRoutingScope> above it; the segment owner calls useRouterScope.');
}

interface Routing<Routes extends RouteTable> {
  location: MosaicLocation;
  table: Routes;
  router: Router<Routes>;
  parts: SegmentParts;
  matched: Route<Routes> | undefined;
}

function useRouting<Routes extends RouteTable>(routes: Routes, options: MosaicLocationOptions): Routing<Routes> {
  const location = useMosaicLocation(options);
  const table = useStableTable(routes);
  const router = useMemo(() => createRouter(table, location), [table, location]);
  const parts = location.useSegmentParts();
  const matched = useMemo(() => router.parse(parts), [router, parts]);
  return { location, table, router, parts, matched };
}

export interface RouterScopeOptions<Routes extends RouteTable> {
  routing: MosaicLocationOptions['routing'];
  path?: string;
  // The route a segment no route matches redirects to, with replace. The owner of a segment always
  // decides what an unknown segment means, so `route` below is never undefined.
  notFound: RouteName<Routes>;
}

export interface RouterScope<Routes extends RouteTable> {
  route: RouteName<Routes>;
  params: Record<string, string>;
  go: Router<Routes>['go'];
  scope: RoutingScope;
}

// For the component that owns a segment of the location. It creates the scope nested routers read,
// and it is the only router that redirects.
export function useRouterScope<const Routes extends RouteTable>(
  routes: Routes,
  { routing, path, notFound }: RouterScopeOptions<Routes>,
): RouterScope<Routes> {
  const scope = useMemo(() => createRoutingScope({ routing, path }), [routing, path]);
  const { location, table, router, parts, matched } = useRouting(routes, { routing, path });
  const current = useMemo<Route<Routes>>(
    () => matched ?? { name: notFound, params: EMPTY_PARAMS },
    [matched, notFound],
  );

  const fallback = useMemo(() => {
    const target = routeParts(table, notFound);
    return router.parse(target) ? target : undefined;
  }, [table, router, notFound]);

  const redirectTo = matched === undefined ? notFound : undefined;
  const redirect = useRef<{ from: SegmentParts; to: SegmentParts }>(undefined);
  useEffect(() => {
    const last = redirect.current;
    redirect.current = undefined;
    if (redirectTo === undefined) {
      return;
    }
    if (fallback === undefined) {
      logger.warnOnce(
        `[Clerk] The notFound route "${redirectTo}" under "${path ?? '/'}" is either missing or needs params, so it cannot be a fallback. Use a route without params.`,
      );
      return;
    }
    if (last && !sameParts(last.from, parts) && !sameParts(last.to, parts)) {
      // This breaks what could otherwise be an infinite redirect loop
      logger.warnOnce(
        `[Clerk] The segment "${last.from.join('/')}" under "${path ?? '/'}" was not found, but after updating the location to match the fallback page, something wrote "${parts.join('/')}" instead. Two routers probably share this base; give one of them a different path.`,
      );
      return;
    }
    redirect.current = { from: parts, to: fallback };
    location.write(fallback, { replace: true });
  }, [parts, redirectTo, fallback, location, path]);

  return useMemo(
    () => ({ route: current.name, params: current.params, go: router.go, scope }),
    [router, scope, current],
  );
}

export interface NestedRouter<Routes extends RouteTable> {
  route: RouteName<Routes> | undefined;
  params: Record<string, string>;
  go: Router<Routes>['go'];
}

// For anything rendered inside a segment owner. It matches its own table against the segment and
// reports no route when the segment belongs to a sibling; it never redirects.
export function useRouter<const Routes extends RouteTable>(routes: Routes): NestedRouter<Routes> {
  const { router, matched } = useRouting(routes, useInheritedScope() ?? missingScope());

  return useMemo(
    () => ({ route: matched?.name, params: matched?.params ?? EMPTY_PARAMS, go: router.go }),
    [router, matched],
  );
}
