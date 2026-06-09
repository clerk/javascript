// @ts-check — JSDoc-typed plugin helpers shared between custom-theme.mjs and extract-methods.mjs.

/**
 * Strip one (or, with `{ deep: true }`, all) `OptionalType` layers and return the inner type. Returns `t` unchanged when it isn't an `OptionalType`, or when `t` is nullish.
 *
 * Typed loosely (`Type` ⊕ `SomeType`) so callers in either type domain can use the same helper; the runtime check is structural (`type === 'optional' && 'elementType' in t`).
 *
 * @template {import('typedoc').Type | import('typedoc').SomeType | undefined} T
 * @param {T} t
 * @param {{ deep?: boolean }} [options]
 * @returns {T}
 */
export function unwrapOptional(t, options) {
  let cur = t;
  while (
    cur &&
    typeof cur === 'object' &&
    /** @type {{ type?: string }} */ (cur).type === 'optional' &&
    'elementType' in cur
  ) {
    cur = /** @type {T} */ (/** @type {{ elementType: import('typedoc').Type }} */ (cur).elementType);
    if (!options?.deep) {
      break;
    }
  }
  return cur;
}
