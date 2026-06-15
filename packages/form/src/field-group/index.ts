import { createField } from '../field';
import type { FieldApi, FieldName, FormApi } from '../types';

/**
 * Resolve local group keys to absolute form paths. Either a prefix string
 * (`'address'` → `address.street`) or an explicit map (`{ street: 'a.b' }`).
 */
export type FieldGroupFields<TFormData> = Record<string, FieldName<TFormData>> | string;

export interface FieldGroupOptions<TFormData> {
  form: FormApi<TFormData>;
  fields: FieldGroupFields<TFormData>;
}

/**
 * A typed subset of a form, addressed by local keys.
 *
 * Intentionally NON-generic and loosely typed: a group accessor is keyed by
 * string and a precise, form-typed surface here would nest `FormApi<T>` and
 * nanostores' recursive `AllPaths` path types, which overflow TypeScript's
 * instantiation-depth limit once the group is built through a wrapper (e.g.
 * `useFieldGroup`). Local keys map to form paths; values are `unknown`. For
 * precise per-field value typing, use `form.Field` / `createField` with the
 * resolved path from {@link FieldGroupApi.resolve}.
 */
export interface FieldGroupApi {
  /** Map a local key to its absolute form path. */
  resolve(localName: string): string;
  getFieldValue(localName: string): unknown;
  setFieldValue(localName: string, value: unknown): void;
  /** Register (and return) a field on the parent form for a local key. */
  getField(localName: string, validators?: unknown): FieldApi<Record<string, unknown>, never>;
  handleSubmit(): Promise<void>;
}

/**
 * Treat a typed subset of the form as a self-contained group. The group owns no
 * state — it projects local keys onto the parent form's stores by path, so a
 * reusable section can address its own fields without knowing where they live in
 * the parent. `options` is typed to your form; the returned group is loose (see
 * {@link FieldGroupApi}).
 */
export function createFieldGroup<TFormData extends object>(options: FieldGroupOptions<TFormData>): FieldGroupApi {
  const { fields } = options;
  // Erased once here so the rest of the body stays free of the deep path types.
  const form = options.form as unknown as FormApi<Record<string, unknown>>;

  function resolve(localName: string): string {
    if (typeof fields === 'string') {
      return `${fields}.${localName}`;
    }
    return (fields as Record<string, string>)[localName];
  }

  return {
    resolve,
    getFieldValue(localName) {
      return form.getFieldValue(resolve(localName));
    },
    setFieldValue(localName, value) {
      form.setFieldValue(resolve(localName), value);
    },
    getField(localName, validators) {
      return createField(form, { name: resolve(localName), validators } as never);
    },
    handleSubmit() {
      return form.handleSubmit();
    },
  };
}
