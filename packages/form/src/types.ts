/**
 * Core type surface for `@clerk/form`.
 *
 * The reactive core is nanostores: each form instance owns a few `map` stores
 * (values, field meta, form meta) and a `computed` derived `$state`. Fields are
 * not separate stores — they are views into the form's stores addressed by a
 * typed path (`AllPaths` / `FromPath` from nanostores).
 */

import type { AllPaths, FromPath, ReadableAtom } from 'nanostores';

// ---------------------------------------------------------------------------
// Field addressing
//
// nanostores already provides typed deep paths and value lookup, so we reuse
// them instead of re-deriving `DeepKeys` / `DeepValue`.
// ---------------------------------------------------------------------------

/** A typed dot/bracket path into the form data (`'email'`, `'friends[0].name'`). */
export type FieldName<TFormData> = AllPaths<TFormData> & string;

/** The value type at a given field path. */
export type FieldValue<TFormData, Name extends FieldName<TFormData>> = FromPath<TFormData, Name>;

// ---------------------------------------------------------------------------
// Standard Schema
//
// Minimal vendored copy of the Standard Schema v1 interface
// (https://github.com/standard-schema/standard-schema). Any validator slot
// accepts either a plain function or a Standard Schema (zod 3.24+, valibot,
// arktype, …). Vendored rather than depended on — it is a types-only spec.
// ---------------------------------------------------------------------------

export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': StandardSchemaProps<Input, Output>;
}

interface StandardSchemaProps<Input, Output> {
  readonly version: 1;
  readonly vendor: string;
  readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>;
  readonly types?: { readonly input: Input; readonly output: Output };
}

export type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> };

export interface StandardIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** When a validator runs. `server` is reserved for SSR-seeded errors. */
export type ValidationCause = 'blur' | 'change' | 'dynamic' | 'mount' | 'server' | 'submit';

/**
 * The raw return of a validator function. Falsy means "valid". Strings and
 * string arrays are errors; objects with a `message` are unwrapped. All are
 * normalized to `string[]` (see `normalizeErrors`).
 */
export type ValidationError = string | string[] | { message: string } | false | null | undefined;

/** Context passed to a field-level validator function. */
export interface FieldValidatorContext<TFormData, Name extends FieldName<TFormData>> {
  value: FieldValue<TFormData, Name>;
  fieldApi: FieldApi<TFormData, Name>;
  signal: AbortSignal;
}

export type FieldValidatorFn<TFormData, Name extends FieldName<TFormData>> = (
  ctx: FieldValidatorContext<TFormData, Name>,
) => ValidationError | Promise<ValidationError>;

/** A field validator: a plain function or a Standard Schema for the field value. */
export type FieldValidatorOrSchema<TFormData, Name extends FieldName<TFormData>> =
  | FieldValidatorFn<TFormData, Name>
  | StandardSchemaV1<FieldValue<TFormData, Name>>;

export interface FieldValidators<TFormData, Name extends FieldName<TFormData>> {
  onMount?: FieldValidatorOrSchema<TFormData, Name>;
  onChange?: FieldValidatorOrSchema<TFormData, Name>;
  onChangeAsync?: FieldValidatorOrSchema<TFormData, Name>;
  onChangeAsyncDebounceMs?: number;
  /** Re-run this field's `onChange` when any of these fields change. */
  onChangeListenTo?: FieldName<TFormData>[];
  onBlur?: FieldValidatorOrSchema<TFormData, Name>;
  onBlurAsync?: FieldValidatorOrSchema<TFormData, Name>;
  onBlurAsyncDebounceMs?: number;
  onBlurListenTo?: FieldName<TFormData>[];
  onSubmit?: FieldValidatorOrSchema<TFormData, Name>;
  onSubmitAsync?: FieldValidatorOrSchema<TFormData, Name>;
}

/** Context passed to a form-level validator function. */
export interface FormValidatorContext<TFormData> {
  value: TFormData;
  formApi: FormApi<TFormData>;
  signal: AbortSignal;
}

/**
 * The structured return of a form-level validator: a form-wide error plus
 * per-field errors keyed by path. A plain return is treated as a form error.
 */
export interface FormValidationResult<TFormData> {
  form?: ValidationError;
  fields?: Partial<Record<FieldName<TFormData>, ValidationError>>;
}

export type FormValidatorFn<TFormData> = (
  ctx: FormValidatorContext<TFormData>,
) => FormValidationResult<TFormData> | ValidationError | Promise<FormValidationResult<TFormData> | ValidationError>;

/** A form validator: a plain function or a Standard Schema for the whole form. */
export type FormValidatorOrSchema<TFormData> = FormValidatorFn<TFormData> | StandardSchemaV1<TFormData>;

export interface FormValidators<TFormData> {
  onMount?: FormValidatorOrSchema<TFormData>;
  onChange?: FormValidatorOrSchema<TFormData>;
  onChangeAsync?: FormValidatorOrSchema<TFormData>;
  onChangeAsyncDebounceMs?: number;
  onBlur?: FormValidatorOrSchema<TFormData>;
  onBlurAsync?: FormValidatorOrSchema<TFormData>;
  onBlurAsyncDebounceMs?: number;
  onSubmit?: FormValidatorOrSchema<TFormData>;
  onSubmitAsync?: FormValidatorOrSchema<TFormData>;
}

// ---------------------------------------------------------------------------
// Listeners (side effects; do not block submission)
// ---------------------------------------------------------------------------

export interface FieldListeners<TFormData, Name extends FieldName<TFormData>> {
  onChange?: (ctx: { value: FieldValue<TFormData, Name>; fieldApi: FieldApi<TFormData, Name> }) => void;
  onChangeDebounceMs?: number;
  onBlur?: (ctx: { value: FieldValue<TFormData, Name>; fieldApi: FieldApi<TFormData, Name> }) => void;
  onBlurDebounceMs?: number;
  onMount?: (ctx: { fieldApi: FieldApi<TFormData, Name> }) => void;
}

// ---------------------------------------------------------------------------
// Field state
// ---------------------------------------------------------------------------

/** Stored per-field meta (the source of truth, held in `$fieldMeta`). */
export interface FieldMetaBase {
  isTouched: boolean;
  isBlurred: boolean;
  isDirty: boolean;
  isValidating: boolean;
  /** Errors keyed by the validator slot that produced them (`onChange`, `onBlurAsync`, …). */
  errorMap: Record<string, string[]>;
}

/** Per-field meta with derived fields added. */
export interface FieldMeta extends FieldMetaBase {
  /** Flat union of every error in `errorMap`. */
  errors: string[];
  isValid: boolean;
  isPristine: boolean;
}

export interface FieldState<TFormData, Name extends FieldName<TFormData>> {
  value: FieldValue<TFormData, Name>;
  meta: FieldMeta;
}

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

/** Stored form-wide meta (held in `$formMeta`). */
export interface FormMetaBase {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  /** A form-level async validator is running. */
  isFormValidating: boolean;
  submissionAttempts: number;
  /** Form-wide errors keyed by validator slot (not attributable to a single field). */
  errorMap: Record<string, string[]>;
}

/** The full derived form state exposed via `form.$state`. */
export interface FormState<TFormData> extends FormMetaBase {
  values: TFormData;
  /** Flat union of every form-level error. */
  errors: string[];
  /** Any field or the form is running an async validator. */
  isValidating: boolean;
  isFieldsValid: boolean;
  isFormValid: boolean;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isPristine: boolean;
  canSubmit: boolean;
  fieldMeta: Record<string, FieldMeta>;
}

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface FormOptions<TFormData> {
  defaultValues?: TFormData;
  validators?: FormValidators<TFormData>;
  listeners?: {
    onChange?: (ctx: { formApi: FormApi<TFormData> }) => void;
    onChangeDebounceMs?: number;
    onSubmit?: (ctx: { formApi: FormApi<TFormData> }) => void;
    onMount?: (ctx: { formApi: FormApi<TFormData> }) => void;
  };
  onSubmit?: (ctx: { value: TFormData; formApi: FormApi<TFormData> }) => unknown;
  onSubmitInvalid?: (ctx: { value: TFormData; formApi: FormApi<TFormData> }) => void;
  /** Allow `canSubmit` to stay `true` even when the form is invalid. */
  canSubmitWhenInvalid?: boolean;
  /** Default debounce for all async validators (overridden per validator). */
  asyncDebounceMs?: number;
}

export interface FieldOptions<TFormData, Name extends FieldName<TFormData>> {
  name: Name;
  defaultValue?: FieldValue<TFormData, Name>;
  validators?: FieldValidators<TFormData, Name>;
  listeners?: FieldListeners<TFormData, Name>;
  asyncDebounceMs?: number;
}

// ---------------------------------------------------------------------------
// API shapes (declared here so option/context types can reference them)
// ---------------------------------------------------------------------------

export interface FieldApi<TFormData, Name extends FieldName<TFormData>> {
  readonly form: FormApi<TFormData>;
  readonly name: Name;
  /** Live field state (value + derived meta). Read on access. */
  readonly state: FieldState<TFormData, Name>;
  mount(): () => void;
  handleChange(
    updater: FieldValue<TFormData, Name> | ((prev: FieldValue<TFormData, Name>) => FieldValue<TFormData, Name>),
  ): void;
  handleBlur(): void;
  setValue(
    updater: FieldValue<TFormData, Name> | ((prev: FieldValue<TFormData, Name>) => FieldValue<TFormData, Name>),
  ): void;
  validate(cause: ValidationCause): Promise<string[]>;
}

export interface FormApi<TFormData> {
  readonly options: FormOptions<TFormData>;
  /** Writable store of form values. */
  readonly $values: ReadableAtom<TFormData>;
  /** Writable store of stored per-field meta. */
  readonly $fieldMeta: ReadableAtom<Record<string, FieldMetaBase>>;
  /** Writable store of stored form meta. */
  readonly $formMeta: ReadableAtom<FormMetaBase>;
  /** Derived, read-only full form state. */
  readonly $state: ReadableAtom<FormState<TFormData>>;
  /** Live snapshot of `$state`. */
  readonly state: FormState<TFormData>;

  mount(): () => void;
  handleSubmit(): Promise<void>;
  reset(values?: TFormData): void;

  getFieldValue<Name extends FieldName<TFormData>>(name: Name): FieldValue<TFormData, Name>;
  setFieldValue<Name extends FieldName<TFormData>>(
    name: Name,
    updater: FieldValue<TFormData, Name> | ((prev: FieldValue<TFormData, Name>) => FieldValue<TFormData, Name>),
  ): void;
  getFieldMeta(name: FieldName<TFormData>): FieldMeta | undefined;
  setFieldMeta(name: FieldName<TFormData>, updater: FieldMetaBase | ((prev: FieldMetaBase) => FieldMetaBase)): void;
  /** Remove a field's value and meta (e.g. when an array row is destroyed). */
  deleteField(name: FieldName<TFormData>): void;

  validateField(name: FieldName<TFormData>, cause: ValidationCause): Promise<string[]>;
  validateAllFields(cause: ValidationCause): Promise<void>;

  /** @internal reindex hook for the array free functions in `@clerk/form`. */
  _clearChildMeta(name: string): void;
  /** @internal store field options + cache its `FieldApi`. */
  _registerField(name: string, options: FieldOptions<TFormData, FieldName<TFormData>>): void;
  /** @internal run mount-time validation/listeners; returns cleanup. */
  _mountField(name: string): () => void;
  /** @internal blur orchestration (touched + blur validation + listeners). */
  _handleBlur(name: string): void;
  /** @internal get (or lazily build) the cached `FieldApi` for a path. */
  _getField(name: string): FieldApi<TFormData, FieldName<TFormData>>;
}
