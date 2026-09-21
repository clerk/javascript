export type RouteTable = Readonly<Record<string, string>>;

export type RouteName<Routes extends RouteTable> = Extract<keyof Routes, string>;

type Segments<Pattern extends string> = Pattern extends `${infer Segment}/${infer Rest}`
  ? Segment | Segments<Rest>
  : Pattern;

type OptionalParamNames<Segment extends string> = Segment extends `:${infer Name}?` ? Name : never;

type RequiredParamNames<Segment extends string> = Segment extends `:${string}?`
  ? never
  : Segment extends `:${infer Name}`
    ? Name
    : never;

export type RouteParams<Pattern extends string> = Record<RequiredParamNames<Segments<Pattern>>, string> &
  Partial<Record<OptionalParamNames<Segments<Pattern>>, string>>;

export interface RouteMatch<Name extends string> {
  name: Name;
  params: Record<string, string>;
}

export type PatternSegment = { param: false; value: string } | { param: true; name: string; optional: boolean };

export interface CompiledRoute<Name extends string> {
  name: Name;
  segments: readonly PatternSegment[];
  minLength: number;
}

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function compilePattern(pattern: string): PatternSegment[] {
  return segmentsOf(pattern).map(segment => {
    if (!segment.startsWith(':')) {
      return { param: false, value: segment };
    }
    const optional = segment.endsWith('?');
    return { param: true, name: segment.slice(1, optional ? -1 : undefined), optional };
  });
}

function minLengthOf(segments: readonly PatternSegment[]): number {
  let minLength = 0;
  for (const [index, segment] of segments.entries()) {
    if (!segment.param || !segment.optional) {
      minLength = index + 1;
    }
  }
  return minLength;
}

function isRouteName<Routes extends RouteTable>(routes: Routes, name: string): name is RouteName<Routes> {
  return Object.prototype.hasOwnProperty.call(routes, name);
}

export function compileRoutes<Routes extends RouteTable>(routes: Routes): CompiledRoute<RouteName<Routes>>[] {
  const compiled: CompiledRoute<RouteName<Routes>>[] = [];
  for (const name of Object.keys(routes)) {
    if (isRouteName(routes, name)) {
      const segments = compilePattern(routes[name]);
      compiled.push({ name, segments, minLength: minLengthOf(segments) });
    }
  }
  return compiled;
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function matchSegments(route: CompiledRoute<string>, segments: string[]): Record<string, string> | undefined {
  if (segments.length < route.minLength || segments.length > route.segments.length) {
    return undefined;
  }
  const params: Record<string, string> = {};
  for (const [index, segment] of segments.entries()) {
    const patternSegment = route.segments[index];
    if (patternSegment.param) {
      params[patternSegment.name] = decodeSegment(segment);
    } else if (patternSegment.value !== segment) {
      return undefined;
    }
  }
  return params;
}

export function matchRoute<Name extends string>(
  routes: readonly CompiledRoute<Name>[],
  path: string,
): RouteMatch<Name> | undefined {
  const segments = segmentsOf(path);
  for (const route of routes) {
    const params = matchSegments(route, segments);
    if (params) {
      return { name: route.name, params };
    }
  }
  return undefined;
}

export function buildPath(segments: readonly PatternSegment[], params: Record<string, string | undefined>): string {
  const parts: string[] = [];
  for (const segment of segments) {
    if (!segment.param) {
      parts.push(segment.value);
      continue;
    }
    const value = params[segment.name];
    if (value !== undefined) {
      parts.push(encodeURIComponent(value));
    }
  }
  return parts.join('/');
}

export function splitQuery(to: string): { path: string; search: string } {
  const index = to.indexOf('?');
  return index === -1 ? { path: to, search: '' } : { path: to.slice(0, index), search: to.slice(index) };
}
