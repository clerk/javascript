import type { AnyMarker } from '../types';

/** A message store, narrowed to the metadata `messagesToJSON` needs. */
interface SourceStore {
  namespace: string;
  base: Record<string, unknown>;
}

function isMarker(value: unknown): value is AnyMarker {
  return typeof value === 'object' && value !== null && '_type' in value;
}

/** Serialize a single `base` value back to its raw JSON form. */
function serialize(value: unknown): unknown {
  if (isMarker(value)) {
    // params / messageFormat carry a template string; count / count-params carry forms.
    return value._type === 'params' || value._type === 'transform' ? value.template : value.forms;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const key in value as Record<string, unknown>) {
      out[key] = serialize((value as Record<string, unknown>)[key]);
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
  const out: Record<string, unknown> = {};
  for (const { namespace, base } of messages) {
    const ns = (out[namespace] ??= {}) as Record<string, unknown>;
    for (const key in base) {
      ns[key] = serialize(base[key]);
    }
  }
  return out;
}
