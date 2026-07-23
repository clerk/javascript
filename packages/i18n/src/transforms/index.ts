import type { TransformMarker } from '../types';

/**
 * Build a custom message transform. `fn` receives the locale and template at
 * resolution time and returns whatever the message should resolve to (commonly
 * a render function). Internal: the basis for `messageFormat`.
 */
export function transform<R>(fn: (locale: string, template: string) => R): (template: string) => TransformMarker<R> {
  return template => ({ _type: 'transform', fn, template });
}
