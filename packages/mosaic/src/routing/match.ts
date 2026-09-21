export type RouteTable = Readonly<Record<string, string>>;

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

function segmentsOf(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function paramNameOf(patternSegment: string): string | undefined {
  return patternSegment.startsWith(':') ? patternSegment.slice(1).replace(/\?$/, '') : undefined;
}

function isOptional(patternSegment: string): boolean {
  return patternSegment.startsWith(':') && patternSegment.endsWith('?');
}

function matchPattern(pattern: string, segments: string[]): Record<string, string> | undefined {
  const patternSegments = segmentsOf(pattern);
  if (segments.length > patternSegments.length) {
    return undefined;
  }
  const params: Record<string, string> = {};
  for (const [index, patternSegment] of patternSegments.entries()) {
    const segment = segments.at(index);
    const paramName = paramNameOf(patternSegment);
    if (segment === undefined) {
      if (!isOptional(patternSegment)) {
        return undefined;
      }
    } else if (paramName) {
      params[paramName] = decodeURIComponent(segment);
    } else if (patternSegment !== segment) {
      return undefined;
    }
  }
  return params;
}

function isRouteName<Routes extends RouteTable>(routes: Routes, name: string): name is Extract<keyof Routes, string> {
  return Object.hasOwn(routes, name);
}

export function matchRoute<Routes extends RouteTable>(
  routes: Routes,
  path: string,
): RouteMatch<Extract<keyof Routes, string>> | undefined {
  const segments = segmentsOf(path);
  for (const name of Object.keys(routes)) {
    const params = matchPattern(routes[name], segments);
    if (params && isRouteName(routes, name)) {
      return { name, params };
    }
  }
  return undefined;
}

export function buildPath(pattern: string, params: Record<string, string | undefined>): string {
  return segmentsOf(pattern)
    .map(segment => {
      const paramName = paramNameOf(segment);
      if (!paramName) {
        return segment;
      }
      const value = params[paramName];
      return value === undefined ? undefined : encodeURIComponent(value);
    })
    .filter(segment => segment !== undefined)
    .join('/');
}

export function splitQuery(to: string): { path: string; search: string } {
  const index = to.indexOf('?');
  return index === -1 ? { path: to, search: '' } : { path: to.slice(0, index), search: to.slice(index) };
}
