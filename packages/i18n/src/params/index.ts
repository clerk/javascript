import type { CountMarker, CountParamsMarker, ParamsMarker } from '../types';

/**
 * Define an interpolated message. Placeholders are written as `{name}` and the
 * resolved message becomes a function whose argument is typed from the template:
 *
 * ```ts
 * params('Hi {name}') // -> (args: { name: string | number }) => string
 * ```
 *
 * Wrap a `count(...)` to define a pluralized message that also takes named
 * params. The resolved message is `(n, args) => string`: `n` selects the plural
 * form, then `{count}` and the named placeholders are substituted.
 *
 * ```ts
 * params<{ category: string }>(count({ one: 'One page in {category}', other: '{count} pages in {category}' }))
 * // -> (n: number, args: { category: string }) => string
 * ```
 */
export function params<T extends string>(template: T): ParamsMarker<T>;
export function params<P extends Record<string, string | number>>(count: CountMarker): CountParamsMarker<P>;
export function params(input: string | CountMarker): ParamsMarker<string> | CountParamsMarker {
  if (typeof input === 'string') {
    return { _type: 'params', template: input };
  }
  return { _type: 'count-params', forms: input.forms };
}
