import type { FieldName, FieldValue, FormApi } from '../types';

/** The subset of field paths whose value is an array. */
export type ArrayFieldName<TFormData extends object> = {
  [K in FieldName<TFormData>]: NonNullable<FieldValue<TFormData, K>> extends readonly unknown[] ? K : never;
}[FieldName<TFormData>];

/** The element type of the array at an array field path. */
type ArrayFieldItem<TFormData extends object, Name extends ArrayFieldName<TFormData>> =
  NonNullable<FieldValue<TFormData, Name>> extends readonly (infer Item)[] ? Item : never;

/**
 * Array field operations as standalone, tree-shakeable functions. Import only
 * the ones you use; the base form does not bundle them.
 *
 * Each is built on `form.setFieldValue`, so it triggers the array field's own
 * validation, listeners, and dynamic dependents. Structural operations
 * (insert/remove/swap/move/clear) also reset child-field meta so per-row errors
 * do not stick to the wrong row after indices shift.
 */

// Erased view of the form used internally. Threading the deep `AllPaths` path
// union through `setFieldValue`'s generic at definition time hits the TS
// instantiation-depth limit; the typing lives on the public signatures.
interface LooseForm {
  getFieldValue(name: string): unknown;
  setFieldValue(name: string, value: unknown): void;
  _clearChildMeta(name: string): void;
}

function loose(form: unknown): LooseForm {
  return form as LooseForm;
}

function readArray(form: LooseForm, name: string): unknown[] {
  const value = form.getFieldValue(name);
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`Cannot run an array operation on field "${name}": its value is not an array.`);
  }
  return value;
}

/**
 * Out-of-range indexes would otherwise reach `splice`/assignment and silently
 * produce sparse arrays or `undefined` items, so they are rejected up front.
 */
function checkIndex(name: string, label: string, index: number, max: number): void {
  if (!Number.isInteger(index) || index < 0 || index > max) {
    throw new RangeError(`${label} index ${index} is out of range for array field "${name}".`);
  }
}

/** Append `value` to the array at `name`. */
export function pushFieldValue<TFormData extends object, Name extends ArrayFieldName<TFormData>>(
  form: FormApi<TFormData>,
  name: Name,
  value: ArrayFieldItem<TFormData, Name>,
): void {
  const f = loose(form);
  f.setFieldValue(name, [...readArray(f, name), value]);
}

/** Insert `value` at `index`. */
export function insertFieldValue<TFormData extends object, Name extends ArrayFieldName<TFormData>>(
  form: FormApi<TFormData>,
  name: Name,
  index: number,
  value: ArrayFieldItem<TFormData, Name>,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  checkIndex(name, 'Insert', index, next.length);
  next.splice(index, 0, value);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Replace the item at `index` (no reindex — indices are unchanged). */
export function replaceFieldValue<TFormData extends object, Name extends ArrayFieldName<TFormData>>(
  form: FormApi<TFormData>,
  name: Name,
  index: number,
  value: ArrayFieldItem<TFormData, Name>,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  checkIndex(name, 'Replace', index, next.length - 1);
  next[index] = value;
  f.setFieldValue(name, next);
}

/** Remove the item at `index`. */
export function removeFieldValue<TFormData extends object>(
  form: FormApi<TFormData>,
  name: ArrayFieldName<TFormData>,
  index: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  checkIndex(name, 'Remove', index, next.length - 1);
  next.splice(index, 1);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Swap the items at `a` and `b`. */
export function swapFieldValues<TFormData extends object>(
  form: FormApi<TFormData>,
  name: ArrayFieldName<TFormData>,
  a: number,
  b: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  checkIndex(name, 'Swap', a, next.length - 1);
  checkIndex(name, 'Swap', b, next.length - 1);
  [next[a], next[b]] = [next[b], next[a]];
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Move the item at `from` to `to`. */
export function moveFieldValues<TFormData extends object>(
  form: FormApi<TFormData>,
  name: ArrayFieldName<TFormData>,
  from: number,
  to: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  checkIndex(name, 'Move source', from, next.length - 1);
  checkIndex(name, 'Move destination', to, next.length - 1);
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Remove every item from the array at `name`. */
export function clearFieldValues<TFormData extends object>(
  form: FormApi<TFormData>,
  name: ArrayFieldName<TFormData>,
): void {
  const f = loose(form);
  readArray(f, name);
  f.setFieldValue(name, []);
  f._clearChildMeta(name);
}
