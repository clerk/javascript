import type { FlatOverrides, NestedOverrides, Registry, ResolvedOverrides } from '../types';

/**
 * Normalize consumer-authored overrides into the `namespace -> key -> value`
 * shape that `createI18n`'s `overrides` store consumes.
 *
 * Two authoring forms are accepted (pick one per call; mixing is tolerated):
 *
 * ```ts
 * // nested — best for grouped overrides
 * defineLocalization({ signIn: { title: 'Log in' } })
 *
 * // flat dot notation — best for sparse / programmatic overrides
 * defineLocalization({ 'signIn.title': 'Log in' })
 * ```
 *
 * A flat key splits on its **first** dot: the first segment is the namespace,
 * the remainder is the key (so `'signIn.start.title'` -> namespace `signIn`,
 * key `start.title`). Namespaces must not contain dots.
 *
 * Pass a registry type argument for precise, autocompleted overrides:
 * `defineLocalization<{ signIn: typeof signInBase }>({ ... })`.
 */
export function defineLocalization<R extends Registry = Registry>(
  overrides: NestedOverrides<R> | FlatOverrides<R>,
): ResolvedOverrides {
  const out: ResolvedOverrides = {};
  for (const key in overrides) {
    const value = (overrides as Record<string, unknown>)[key];
    const dot = key.indexOf('.');
    if (dot === -1) {
      // Nested form: `key` is a namespace, `value` is its `{ key: value }` map.
      Object.assign((out[key] ??= {}), value);
    } else {
      // Flat form: split on the first dot into namespace + key.
      (out[key.slice(0, dot)] ??= {})[key.slice(dot + 1)] = value;
    }
  }
  return out;
}
