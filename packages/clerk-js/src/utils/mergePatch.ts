import { dequal } from 'dequal';

/**
 * Computes a JSON Merge Patch (RFC 7396) that, when deep-merged into `current`,
 * produces `desired`. Keys present in `current` but absent from `desired`
 * receive `null` in the patch (RFC 7396 null-delete semantics).
 *
 * Used to express *replace* semantics through a merge endpoint: the SDK
 * holds the current resource state locally, the consumer passes the desired
 * state, and we send the diff that makes the server side end up at the
 * desired state.
 *
 * Behaviour:
 *  - both plain objects: recurse; emit only keys whose value changes
 *  - `desired === null`: returned verbatim (caller decides what null means)
 *  - any other type mismatch: `desired` is returned (full replace at that node)
 */
export function computeMergePatch(current: unknown, desired: unknown): unknown {
  if (desired === null) {
    return null;
  }
  if (!isPlainObject(current) || !isPlainObject(desired)) {
    return desired;
  }

  const patch: Record<string, unknown> = {};

  for (const key of Object.keys(desired)) {
    const cur = current[key];
    const des = desired[key];

    if (!(key in current)) {
      patch[key] = des;
      continue;
    }

    if (isPlainObject(cur) && isPlainObject(des)) {
      const sub = computeMergePatch(cur, des);
      if (isPlainObject(sub) && Object.keys(sub).length === 0) {
        continue;
      }
      patch[key] = sub;
    } else if (!dequal(cur, des)) {
      patch[key] = des;
    }
  }

  for (const key of Object.keys(current)) {
    if (!(key in desired)) {
      patch[key] = null;
    }
  }

  return patch;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}
