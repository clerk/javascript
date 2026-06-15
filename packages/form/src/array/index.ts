import type { FieldName, FormApi } from '../types';

/**
 * Array field operations as standalone, tree-shakeable functions (in the
 * nanostores spirit of free functions over stores, e.g. `listenKeys($store)`).
 * Import only the ones you use; the base form does not bundle them.
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
  return Array.isArray(value) ? value : [];
}

/** Append `value` to the array at `name`. */
export function pushFieldValue<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  value: unknown,
): void {
  const f = loose(form);
  f.setFieldValue(name, [...readArray(f, name), value]);
}

/** Insert `value` at `index`. */
export function insertFieldValue<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  index: number,
  value: unknown,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  next.splice(index, 0, value);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Replace the item at `index` (no reindex — indices are unchanged). */
export function replaceFieldValue<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  index: number,
  value: unknown,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  next[index] = value;
  f.setFieldValue(name, next);
}

/** Remove the item at `index`. */
export function removeFieldValue<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  index: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  next.splice(index, 1);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Swap the items at `a` and `b`. */
export function swapFieldValues<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  a: number,
  b: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  [next[a], next[b]] = [next[b], next[a]];
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Move the item at `from` to `to`. */
export function moveFieldValues<TFormData extends object>(
  form: FormApi<TFormData>,
  name: FieldName<TFormData>,
  from: number,
  to: number,
): void {
  const f = loose(form);
  const next = [...readArray(f, name)];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  f.setFieldValue(name, next);
  f._clearChildMeta(name);
}

/** Remove every item from the array at `name`. */
export function clearFieldValues<TFormData extends object>(form: FormApi<TFormData>, name: FieldName<TFormData>): void {
  const f = loose(form);
  f.setFieldValue(name, []);
  f._clearChildMeta(name);
}
