import type { AnyMarker } from '../types';

/** A message store, narrowed to the metadata `messagesToJSON` needs. */
interface SourceStore {
  namespace: string;
  base: Record<string, unknown>;
}

function isMarker(value: unknown): value is AnyMarker {
  return typeof value === 'object' && value !== null && '_type' in value;
}

const SKIP = Symbol('skip');

/** Serialize a single `base` value back to its raw JSON form. */
function serialize(value: unknown) {
  if (isMarker(value)) {
    if (value._type === 'currency') {
      return SKIP;
    }
    // params / messageFormat carry a template string; count / count-params carry forms.
    return value._type === 'params' || value._type === 'transform' ? value.template : value.forms;
  }
  if (value && typeof value === 'object') {
    const out = Object.create(null) as Record<string, unknown>;
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const serialized = serialize((value as Record<string, unknown>)[key]);
      if (serialized !== SKIP) {
        out[key] = serialized;
      }
    }
    return out;
  }
  return value;
}

/**
 * Extract the base (source-locale) strings from message stores into a single
 * `{ namespace: { key: raw } }` object, ready to hand to a translation service.
 * Markers serialize back to their raw form (`params`/`messageFormat` → template,
 * `count`/`params(count)` → plural forms). Run in CI after importing every
 * `*.messages` module.
 *
 * ```ts
 * messagesToJSON($signIn, $signUp); // { signIn: { … }, signUp: { … } }
 * ```
 */
export function messagesToJSON(...messages: SourceStore[]): Record<string, unknown> {
  const out = Object.create(null) as Record<string, unknown>;
  for (const { namespace, base } of messages) {
    const ns = (out[namespace] ??= Object.create(null)) as Record<string, unknown>;
    for (const key of Object.keys(base)) {
      const serialized = serialize(base[key]);
      if (serialized !== SKIP) {
        ns[key] = serialized;
      }
    }
  }
  return out;
}
