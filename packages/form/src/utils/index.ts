/** Flatten a slot-keyed error map into a deduped flat list. */
export function flattenErrorMap(map: Record<string, string[]>): string[] {
  const out: string[] = [];
  for (const key in map) {
    for (const error of map[key]) {
      if (!out.includes(error)) {
        out.push(error);
      }
    }
  }
  return out;
}

/** Structural equality for plain form values (objects, arrays, primitives). */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const aArray = Array.isArray(a);
  if (aArray !== Array.isArray(b)) {
    return false;
  }
  if (aArray) {
    const aArr = a as unknown[];
    const bArr = b as unknown[];
    if (aArr.length !== bArr.length) {
      return false;
    }
    for (let i = 0; i < aArr.length; i++) {
      if (!deepEqual(aArr[i], bArr[i])) {
        return false;
      }
    }
    return true;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

/** Cheap structured clone for default values (plain JSON-like data). */
export function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(clone) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const key in value) {
    out[key] = clone((value as Record<string, unknown>)[key]);
  }
  return out as T;
}
