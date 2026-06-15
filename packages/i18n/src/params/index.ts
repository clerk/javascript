import type { ParamsMarker } from '../types';

/**
 * Define an interpolated message. Placeholders are written as `{name}` and the
 * resolved message becomes a function whose argument is typed from the template:
 *
 * ```ts
 * params('Hi {name}') // -> (args: { name: string | number }) => string
 * ```
 */
export function params<T extends string>(template: T): ParamsMarker<T> {
  return { _type: 'params', template };
}
