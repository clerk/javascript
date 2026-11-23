import { useEffect, useMemo, useRef, useState } from 'react';

import type { MosaicLocation, SegmentParts } from './location';
import type { Route, Router } from './router';
import { createRouter } from './router';
import type { RouteName, RouteTable } from './routes';
import { isRouteName, routeParts } from './routes';
import type { RoutingScope } from './routing-scope';
import { createRoutingScope, useInheritedScope } from './routing-scope';
import type { MosaicLocationOptions } from './use-mosaic-location';
import { useMosaicLocation } from './use-mosaic-location';

const EMPTY_PARAMS: Record<string, string> = Object.freeze({});
const EMPTY_PARTS: SegmentParts = Object.freeze([]);

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

// The scope owns its base while its effects are live, and returns the entry it should render from.
// When the last owner leaves, the location drops the entry, so the next mount starts fresh the way
// a URL would after the host navigated away. Effects also stop when React parks the component
// without unmounting it (Activity), and then the component's state survives. In virtual mode the
// cleanup therefore parks the entry in state, the scope keeps rendering from the parked entry while
// it is hidden, so the page's subtree keeps its state, and the effects that run on resume write it
// back, unless something else wrote the base in between. The ownership effect's dependencies never
// change on a navigation, so its cleanup only runs on hide, unmount or a change of location; it
// reads the entry to park from a ref that is written in an effect and read nowhere else. A park
// is tied to the location it was taken from, so a scope that moves to another base does not carry
// its page along. The parked value is consumed during render as soon as an entry is present again,
// so a mounted scope never falls back to it, and an entry cleared from outside shows the root. A
// URL mode holds the segment in its carrier and parks nothing.
interface ParkedSegment {
  location: MosaicLocation;
  parts: SegmentParts;
}

function useOwnedSegment(
  location: MosaicLocation,
  entry: SegmentParts | undefined,
  parks: boolean,
): SegmentParts | undefined {
  const [parked, setParked] = useState<ParkedSegment | undefined>(undefined);
  if (parked !== undefined && (entry !== undefined || parked.location !== location)) {
    setParked(undefined);
  }
  const held = parked !== undefined && parked.location === location ? parked.parts : undefined;
  const latest = useRef(entry);
  useEffect(() => {
    latest.current = entry;
  }, [entry]);
  useEffect(() => {
    if (parks && held !== undefined && entry === undefined) {
      location.write(held, { replace: true });
    }
  }, [location, parks, held, entry]);
  useEffect(() => {
    const release = location.own();
    return () => {
      const parts = latest.current;
      if (parks && parts !== undefined) {
        setParked({ location, parts });
      }
      release();
    };
  }, [location, parks]);
  return entry ?? held;
}

function missingScope(): never {
  throw new Error('[clerk] useRouter needs a <MosaicRoutingScope> above it; the segment owner calls useRouterScope.');
}

interface Routing<Routes extends RouteTable> {
  location: MosaicLocation;
  table: Routes;
  router: Router<Routes>;
  entry: SegmentParts | undefined;
}

function useRouting<Routes extends RouteTable>(routes: Routes, options: MosaicLocationOptions): Routing<Routes> {
  const location = useMosaicLocation(options);
  const table = useStableTable(routes);
  const router = useMemo(() => createRouter(table, location), [table, location]);
  const entry = location.useSegmentParts();
  return { location, table, router, entry };
}

function useMatch<Routes extends RouteTable>(router: Router<Routes>, entry: SegmentParts | undefined) {
  const parts = entry ?? EMPTY_PARTS;
  const matched = useMemo(() => router.parse(parts), [router, parts]);
  return { parts, matched };
}

export interface RouterScopeOptions<Routes extends RouteTable> {
  routing: MosaicLocationOptions['routing'];
  path?: string;
  // The route that lives at the base. It is matched by the empty segment and `go` writes the
  // empty segment for it, whatever pattern the table gives it; that pattern is accepted too and
  // canonicalised to the base. Any other segment no route matches shows the root and is replaced
  // with the base as well. The owner of a segment always decides what an unknown segment means, so
  // `route` below is never undefined, and because every owner's fallback is its base, two owners
  // of one base cannot redirect each other.
  root: RouteName<Routes>;
  // Whether the table is settled. While false the scope reports no route and writes nothing, so an
  // entry the table cannot match yet is kept until it can. Pass it when the routes depend on data
  // that has not arrived, and handle the undefined route that comes with it.
  ready?: boolean;
  // Where a segment nothing matches goes instead of the root, asked with the segment; a profile
  // sends an unknown page in the organization group to that group's first page. Returning nothing,
  // or a name that is not a route, means the root.
  notFound?: (parts: SegmentParts) => RouteName<Routes> | undefined;
}

export interface RouterScope<Routes extends RouteTable, Name = RouteName<Routes>> {
  route: Name;
  params: Record<string, string>;
  go: Router<Routes>['go'];
  scope: RoutingScope;
}

// For the component that owns a segment of the location. It creates the scope nested routers read,
// and it is the only router that redirects.
export function useRouterScope<const Routes extends RouteTable>(
  routes: Routes,
  options: RouterScopeOptions<Routes> & { ready: boolean },
): RouterScope<Routes, RouteName<Routes> | undefined>;
export function useRouterScope<const Routes extends RouteTable>(
  routes: Routes,
  options: Omit<RouterScopeOptions<Routes>, 'ready'>,
): RouterScope<Routes>;
export function useRouterScope<const Routes extends RouteTable>(
  routes: Routes,
  { routing, path, root, ready = true, notFound }: RouterScopeOptions<Routes>,
): RouterScope<Routes, RouteName<Routes> | undefined> {
  const scope = useMemo(() => createRoutingScope({ routing, path }), [routing, path]);
  const rooted: Routes = Object.assign({}, routes, { [root]: '' });
  const { location, table, router, entry } = useRouting(rooted, { routing, path });
  const held = useOwnedSegment(location, entry, routing === 'virtual');
  const { parts, matched } = useMatch(router, held);
  const fallback = useMemo<RouteName<Routes> | undefined>(() => {
    if (!ready || matched !== undefined) {
      return undefined;
    }
    const name = notFound?.(parts);
    return name !== undefined && isRouteName(table, name) ? name : root;
  }, [ready, matched, notFound, parts, table, root]);
  const current = useMemo<Route<Routes> | undefined>(() => {
    if (!ready) {
      return undefined;
    }
    return matched ?? { name: fallback ?? root, params: EMPTY_PARAMS };
  }, [ready, matched, fallback, root]);

  useEffect(() => {
    if (fallback !== undefined) {
      location.write(routeParts(table, fallback), { replace: true });
    }
  }, [parts, fallback, location, table]);

  return useMemo(
    () => ({ route: current?.name, params: current?.params ?? EMPTY_PARAMS, go: router.go, scope }),
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
  const { router, entry } = useRouting(routes, useInheritedScope() ?? missingScope());
  const { matched } = useMatch(router, entry);

  return useMemo(
    () => ({ route: matched?.name, params: matched?.params ?? EMPTY_PARAMS, go: router.go }),
    [router, matched],
  );
}
