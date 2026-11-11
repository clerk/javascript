// The codec between route names and the parts of the segment a component owns. It is pure and
// representation-free: it works on decoded parts, never on a URL string, and never encodes or
// decodes anything. That is the location's job.
//
// The shapes, end to end:
//   table    { statement: 'billing/statement/:id' }            names to patterns, what a surface declares
//   compiled { name: 'statement', parts: [...], minLength: 3 }  one entry per route, ready to match
//   parts    ['billing', 'statement', 'st_1']                   the decoded segment a location hands over
//   match    { name: 'statement', params: { id: 'st_1' } }      what the surface renders from
//
// matchRoute goes parts -> match. buildParts and routeParts go name + params -> parts.

// { statement: 'billing/statement/:id' }. A pattern is relative to the component's base; `:name` captures a part, `:name?` may be absent.
export type RouteTable = Readonly<Record<string, string>>;

export type RouteName<Routes extends RouteTable> = Extract<keyof Routes, string>;

// 'billing/statement/:id' -> 'billing' | 'statement' | ':id'
type Parts<Pattern extends string> = Pattern extends `${infer Part}/${infer Rest}` ? Part | Parts<Rest> : Pattern;

type OptionalParamNames<Part extends string> = Part extends `:${infer Name}?` ? Name : never;

type RequiredParamNames<Part extends string> = Part extends `:${string}?`
  ? never
  : Part extends `:${infer Name}`
    ? Name
    : never;

// 'org/:orgId/member/:memberId?' -> { orgId: string; memberId?: string }
export type RouteParams<Pattern extends string> = Record<RequiredParamNames<Parts<Pattern>>, string> &
  Partial<Record<OptionalParamNames<Parts<Pattern>>, string>>;

export interface RouteMatch<Name extends string> {
  name: Name;
  params: Record<string, string>;
}

// 'billing' -> { param: false, value: 'billing' }    ':id?' -> { param: true, name: 'id', optional: true }
export type PatternPart = { param: false; value: string } | { param: true; name: string; optional: boolean };

// minLength is how many parts a segment must have to match: up to the last non-optional part.
export interface CompiledRoute<Name extends string> {
  name: Name;
  parts: readonly PatternPart[];
  minLength: number;
}

// '/billing//plans/' -> ['billing', 'plans']
function partsOf(pattern: string): string[] {
  return pattern.split('/').filter(Boolean);
}

// Literals are compared against decoded parts, so an encoded literal such as 'api%20keys' could never match the way it reads.
function isDecodedLiteral(part: string): boolean {
  return !part.includes('%');
}

function assertDecodedLiteral(part: string): void {
  if (!isDecodedLiteral(part)) {
    throw new Error(
      `[Clerk] Route pattern part "${part}" must be written decoded; patterns are matched against decoded parts.`,
    );
  }
}

// 'billing/plans/:planId?' -> [{ param: false, value: 'billing' }, { param: false, value: 'plans' }, { param: true, name: 'planId', optional: true }]
export function compilePattern(pattern: string): PatternPart[] {
  const parts = partsOf(pattern).map<PatternPart>(part => {
    if (!part.startsWith(':')) {
      assertDecodedLiteral(part);
      return { param: false, value: part };
    }
    const optional = part.endsWith('?');
    const name = part.slice(1, optional ? -1 : undefined);
    if (name === '') {
      throw new Error(`[clerk] Route pattern "${pattern}" has a param without a name.`);
    }
    return { param: true, name, optional };
  });
  const firstOptional = parts.findIndex(part => part.param && part.optional);
  if (firstOptional !== -1 && parts.slice(firstOptional).some(part => !part.param || !part.optional)) {
    throw new Error(
      `[clerk] Route pattern "${pattern}" has a required part after an optional one; optional parts come last.`,
    );
  }
  return parts;
}

// 'billing/plans/:planId?' -> 2    'billing/statement/:id' -> 3
function minLengthOf(parts: readonly PatternPart[]): number {
  let minLength = 0;
  for (const [index, part] of parts.entries()) {
    if (!part.param || !part.optional) {
      minLength = index + 1;
    }
  }
  return minLength;
}

export function isRouteName<Routes extends RouteTable>(routes: Routes, name: string): name is RouteName<Routes> {
  return Object.prototype.hasOwnProperty.call(routes, name);
}

// { security: 'security', statement: 'billing/statement/:id' } -> [compiled security, compiled statement]
// Declaration order is match precedence.
export function compileRoutes<Routes extends RouteTable>(routes: Routes): CompiledRoute<RouteName<Routes>>[] {
  const compiled: CompiledRoute<RouteName<Routes>>[] = [];
  for (const [name, pattern] of Object.entries(routes)) {
    if (isRouteName(routes, name)) {
      const parts = compilePattern(pattern);
      compiled.push({ name, parts, minLength: minLengthOf(parts) });
    }
  }
  return compiled;
}

// compiled 'billing/statement/:id' + ['billing', 'statement', 'st_1'] -> { id: 'st_1' }
// Literals must be equal, params capture verbatim, the part count must fit between minLength and the full length.
function matchParts(route: CompiledRoute<string>, parts: readonly string[]): Record<string, string> | undefined {
  if (parts.length < route.minLength || parts.length > route.parts.length) {
    return undefined;
  }
  const params: Record<string, string> = {};
  for (const [index, part] of parts.entries()) {
    const patternPart = route.parts[index];
    if (!patternPart) {
      return undefined;
    }
    if (patternPart.param) {
      params[patternPart.name] = part;
    } else if (patternPart.value !== part) {
      return undefined;
    }
  }
  return params;
}

// ['billing', 'statement', 'st_1'] -> { name: 'statement', params: { id: 'st_1' } }, or undefined when no route fits
export function matchRoute<Name extends string>(
  routes: readonly CompiledRoute<Name>[],
  parts: readonly string[],
): RouteMatch<Name> | undefined {
  for (const route of routes) {
    const params = matchParts(route, parts);
    if (params) {
      return { name: route.name, params };
    }
  }
  return undefined;
}

// (table, 'statement', { id: 'st_1' }) -> ['billing', 'statement', 'st_1']    unknown name -> []
// For callers that have a table but no router.
export function routeParts(
  routes: RouteTable,
  name: string,
  params: Record<string, string | undefined> = {},
): string[] {
  const pattern = isRouteName(routes, name) ? routes[name] : undefined;
  return pattern === undefined ? [] : buildParts(compilePattern(pattern), params);
}

// compiled 'billing/plans/:planId?' + { planId: 'pro' } -> ['billing', 'plans', 'pro']    + {} -> ['billing', 'plans']
// A param after an omitted optional one has no place to go: it would take the omitted one's
// position and read back under its name, so it is a caller error rather than a shorter segment.
export function buildParts(parts: readonly PatternPart[], params: Record<string, string | undefined>): string[] {
  const built: string[] = [];
  let omitted: string | undefined;
  for (const part of parts) {
    if (!part.param) {
      built.push(part.value);
      continue;
    }
    const value = params[part.name];
    if (value === undefined) {
      omitted ??= part.name;
      continue;
    }
    if (omitted !== undefined) {
      throw new Error(`[clerk] Route param "${part.name}" was given without "${omitted}" before it.`);
    }
    built.push(value);
  }
  return built;
}
