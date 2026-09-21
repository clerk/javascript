import type { MosaicLocation } from './location';
import { buildPath, matchRoute, type RouteParams, type RouteTable, splitQuery } from './match';

type RouteName<Routes extends RouteTable> = Extract<keyof Routes, string>;

export type SearchParams = Record<string, string>;

export interface Page<Routes extends RouteTable> {
  route: RouteName<Routes>;
  params: Record<string, string>;
  path: string;
  search: SearchParams;
}

type RouteArgs<Pattern extends string, Rest> =
  Record<never, never> extends RouteParams<Pattern>
    ? [params?: RouteParams<Pattern>, rest?: Rest]
    : [params: RouteParams<Pattern>, rest?: Rest];

export interface OpenOptions {
  replace?: boolean;
}

export interface GoOptions extends OpenOptions {
  search?: SearchParams;
}

export interface Router<Routes extends RouteTable> {
  get: () => Page<Routes> | undefined;
  subscribe: (listener: () => void) => () => void;
  open: (to: string, options?: OpenOptions) => Promise<void>;
  href: <Name extends RouteName<Routes>>(name: Name, ...args: RouteArgs<Routes[Name], SearchParams>) => string;
  go: <Name extends RouteName<Routes>>(name: Name, ...args: RouteArgs<Routes[Name], GoOptions>) => Promise<void>;
}

interface RouterOptions {
  commit?: (update: () => void) => void;
  preservedSearchParams?: readonly string[];
}

interface Navigation {
  to: string;
  promise: Promise<void>;
}

export function createRouter<const Routes extends RouteTable>(
  routes: Routes,
  location: MosaicLocation,
  { commit = update => update(), preservedSearchParams = [] }: RouterOptions = {},
): Router<Routes> {
  const listeners = new Set<() => void>();
  let inFlight: Navigation | undefined;
  let stopListening: (() => void) | undefined;

  const parse = (to: string): Page<Routes> | undefined => {
    const { path, search } = splitQuery(to);
    const match = matchRoute(routes, path);
    if (!match) {
      return undefined;
    }
    return { route: match.name, params: match.params, path, search: Object.fromEntries(new URLSearchParams(search)) };
  };

  let lastPath = location.read();
  let page = parse(lastPath);

  const set = (to: string) => {
    lastPath = to;
    page = parse(to);
    for (const listener of listeners) {
      listener();
    }
  };

  const refresh = () => {
    if (inFlight) {
      return;
    }
    const path = location.read();
    if (path !== lastPath) {
      set(path);
    }
  };

  const navigate = async (navigation: Navigation, replace: boolean) => {
    try {
      await location.write(navigation.to, { replace });
      if (inFlight === navigation) {
        commit(() => set(navigation.to));
      }
    } finally {
      if (inFlight === navigation) {
        inFlight = undefined;
      }
    }
  };

  const pathTo = (pattern: string, params: Record<string, string | undefined> = {}, search: SearchParams = {}) => {
    const path = buildPath(pattern, params);
    const query = new URLSearchParams(search).toString();
    return query ? `${path}?${query}` : path;
  };

  const preservedSearch = (): SearchParams => {
    const current = page?.search ?? {};
    return Object.fromEntries(preservedSearchParams.flatMap(key => (key in current ? [[key, current[key]]] : [])));
  };

  const open = (to: string, { replace = false }: OpenOptions = {}) => {
    if (inFlight?.to === to) {
      return inFlight.promise;
    }
    const navigation: Navigation = { to, promise: Promise.resolve() };
    inFlight = navigation;
    navigation.promise = navigate(navigation, replace);
    return navigation.promise;
  };

  return {
    get: () => page,
    subscribe: listener => {
      if (listeners.size === 0) {
        stopListening = location.subscribe(refresh);
        refresh();
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stopListening?.();
          stopListening = undefined;
        }
      };
    },
    open,
    href: (name, ...args) => {
      const [params, search] = args;
      return pathTo(routes[name], params, search);
    },
    go: (name, ...args) => {
      const [params, { search, replace } = {}] = args;
      return open(pathTo(routes[name], params, { ...preservedSearch(), ...search }), { replace });
    },
  };
}
