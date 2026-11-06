import { logger } from '@clerk/shared/logger';

import type { MosaicLocation, SegmentParts, WriteOptions } from './location';
import {
  buildParts,
  compileRoutes,
  matchRoute,
  type PatternPart,
  type RouteName,
  type RouteParams,
  type RouteTable,
} from './routes';

export interface Route<Routes extends RouteTable> {
  name: RouteName<Routes>;
  params: Record<string, string>;
}

type RouteArgs<Pattern extends string, Rest> =
  Record<never, never> extends RouteParams<Pattern>
    ? [params?: RouteParams<Pattern>, rest?: Rest]
    : [params: RouteParams<Pattern>, rest?: Rest];

export interface Router<Routes extends RouteTable> {
  parse: (parts: SegmentParts) => Route<Routes> | undefined;
  go: <Name extends RouteName<Routes>>(name: Name, ...args: RouteArgs<Routes[Name], WriteOptions>) => void;
}

export function createRouter<const Routes extends RouteTable>(
  routes: Routes,
  location: MosaicLocation,
): Router<Routes> {
  const compiled = compileRoutes(routes);
  const patternsByName = new Map<string, readonly PatternPart[]>(compiled.map(route => [route.name, route.parts]));

  return {
    parse: parts => {
      const match = matchRoute(compiled, parts);
      return match ? { name: match.name, params: match.params } : undefined;
    },
    go: (name, ...args) => {
      const pattern = patternsByName.get(name);
      if (pattern === undefined) {
        logger.warnOnce(`[Clerk] "${name}" is not a route of this router, so nothing was navigated to.`);
        return;
      }
      const [params = {}, options] = args;
      location.write(buildParts(pattern, params), options);
    },
  };
}
