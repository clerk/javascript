import type { FieldApi, FieldMeta, FieldName, FieldOptions, FieldState, FormApi, ValidationCause } from '../types';

const EMPTY_META: FieldMeta = {
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isValidating: false,
  errorMap: {},
  errors: [],
  isValid: true,
  isPristine: true,
};

/**
 * Build a `FieldApi` handle bound to a form + path. The field owns no state of
 * its own — every read and write goes through the form's stores by `name`.
 */
export function buildField<TFormData, Name extends FieldName<TFormData>>(
  form: FormApi<TFormData>,
  name: Name,
): FieldApi<TFormData, Name> {
  return {
    form,
    name,
    get state(): FieldState<TFormData, Name> {
      return {
        value: form.getFieldValue(name),
        meta: (form.state.fieldMeta[name] as FieldMeta | undefined) ?? EMPTY_META,
      };
    },
    mount() {
      return form._mountField(name);
    },
    handleChange(updater) {
      form.setFieldValue(name, updater);
    },
    handleBlur() {
      form._handleBlur(name);
    },
    setValue(updater) {
      form.setFieldValue(name, updater);
    },
    validate(cause: ValidationCause) {
      return form.validateField(name, cause);
    },
  };
}

/**
 * Register a field's options on the form and return its `FieldApi`. The returned
 * handle is cached on the form, so repeated calls for the same `name` return the
 * same instance.
 */
export function createField<TFormData, Name extends FieldName<TFormData>>(
  form: FormApi<TFormData>,
  options: FieldOptions<TFormData, Name>,
): FieldApi<TFormData, Name> {
  form._registerField(options.name, options as FieldOptions<TFormData, FieldName<TFormData>>);
  return form._getField(options.name) as FieldApi<TFormData, Name>;
}
