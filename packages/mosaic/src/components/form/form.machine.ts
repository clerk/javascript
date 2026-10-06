import type { LocalizableError } from '../../localization';
import { setup } from '../../machine/setup';
import { SaveError } from '../../utils/form-error';
import { keysOf, mapKeys } from '../../utils/object';
import type { FieldFeedback, FormError, FormFieldErrors } from './form-submit-error';
import { FormSubmitError } from './form-submit-error';

export type FieldValidator<TValue, TValues extends object> = (
  value: TValue,
  values: TValues,
) => FieldFeedback | undefined;

export type AsyncFieldValidator<TValue, TValues extends object> = (
  value: TValue,
  values: TValues,
) => Promise<FieldFeedback | undefined>;

export interface FieldConfig<TValue, TValues extends object> {
  validate?: FieldValidator<TValue, TValues>;
  validateAsync?: AsyncFieldValidator<TValue, TValues>;
}

export type FieldsConfig<TValues extends object> = { [K in keyof TValues]?: FieldConfig<TValues[K], TValues> };

export interface AsyncFieldState {
  value: unknown;
  feedback: FieldFeedback | undefined;
  pending: boolean;
}

export interface FormDeps<TValues extends object> {
  initialValues: TValues;
  fields: FieldsConfig<TValues> | undefined;
  onSubmit: (values: TValues) => Promise<unknown>;
  canSubmit: (values: TValues) => boolean;
  fallbackMessage: string;
  errorText: (error: LocalizableError) => string;
}

export interface FormContext<TValues extends object> {
  values: TValues;
  baseline: TValues | undefined;
  touched: Partial<Record<keyof TValues, true>>;
  async: Partial<Record<keyof TValues, AsyncFieldState>>;
  error: FormError<TValues> | undefined;
  submitQueued: boolean;
}

export type FormEvent<TValues extends object> =
  | { type: 'CHANGE'; name: keyof TValues; value: TValues[keyof TValues] }
  | { type: 'TOUCH'; name: keyof TValues }
  | { type: 'VALIDATED'; name: keyof TValues; value: unknown; feedback: FieldFeedback | undefined }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; values?: TValues };

export function initialOf<TValues extends object>(context: FormContext<TValues>, initialValues: TValues): TValues {
  return context.baseline ?? initialValues;
}

function syncFeedback<TValues extends object>(
  context: FormContext<TValues>,
  fields: FieldsConfig<TValues> | undefined,
  name: keyof TValues,
): FieldFeedback | undefined {
  return fields?.[name]?.validate?.(context.values[name], context.values);
}

function settledAsyncFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  const state = context.async[name];
  return state?.pending === true ? undefined : state?.feedback;
}

export function validatorFeedback<TValues extends object>(
  context: FormContext<TValues>,
  fields: FieldsConfig<TValues> | undefined,
  name: keyof TValues,
): FieldFeedback | undefined {
  return syncFeedback(context, fields, name) ?? context.async[name]?.feedback;
}

export function fieldFeedback<TValues extends object>(
  context: FormContext<TValues>,
  fields: FieldsConfig<TValues> | undefined,
  name: keyof TValues,
): FieldFeedback | undefined {
  const submitError = context.error?.fields?.[name];
  return submitError === undefined ? validatorFeedback(context, fields, name) : { type: 'error', message: submitError };
}

export function firstInvalid<TValues extends object>(
  context: FormContext<TValues>,
  fields: FieldsConfig<TValues> | undefined,
): keyof TValues | undefined {
  return keysOf(context.values).find(
    name => (syncFeedback(context, fields, name) ?? settledAsyncFeedback(context, name))?.type === 'error',
  );
}

export function isValid<TValues extends object>(
  context: FormContext<TValues>,
  fields: FieldsConfig<TValues> | undefined,
  canSubmit: (values: TValues) => boolean,
): boolean {
  return canSubmit(context.values) && firstInvalid(context, fields) === undefined;
}

function isValidating<TValues extends object>(context: FormContext<TValues>): boolean {
  return keysOf(context.values).some(name => context.async[name]?.pending === true);
}

function displayableFields<TValues extends object>(
  context: FormContext<TValues>,
  fields: FormFieldErrors<TValues> | undefined,
): FormFieldErrors<TValues> | undefined {
  if (fields === undefined) {
    return undefined;
  }
  const result: FormFieldErrors<TValues> = {};
  for (const name of keysOf(context.values)) {
    const message = fields[name];
    if (message !== undefined && message !== '') {
      result[name] = message;
    }
  }
  return result;
}

function savedFieldErrors<TValues extends object>(
  context: FormContext<TValues>,
  fields: Partial<Record<string, LocalizableError>> | undefined,
  errorText: (error: LocalizableError) => string,
): FormFieldErrors<TValues> {
  const result: FormFieldErrors<TValues> = {};
  for (const name of keysOf(context.values)) {
    const error = typeof name === 'string' ? fields?.[name] : undefined;
    if (error !== undefined) {
      result[name] = errorText(error);
    }
  }
  return result;
}

function toFormError<TValues extends object>(
  cause: unknown,
  context: FormContext<TValues>,
  deps: FormDeps<TValues>,
): FormError<TValues> {
  if (!(cause instanceof FormSubmitError) && !(cause instanceof SaveError)) {
    console.error(cause);
    return { message: deps.fallbackMessage };
  }
  const error: FormError<TValues> =
    cause instanceof FormSubmitError
      ? { message: cause.banner, fields: displayableFields(context, cause.fields) }
      : {
          message: cause.formError.global ? deps.errorText(cause.formError.global) : undefined,
          fields: savedFieldErrors(context, cause.formError.fields, deps.errorText),
        };
  const visible = (error.message ?? '') !== '' || keysOf(error.fields ?? {}).length > 0;
  return visible ? error : { ...error, message: deps.fallbackMessage };
}

function withoutField<TValues extends object>(
  error: FormError<TValues> | undefined,
  name: keyof TValues,
): FormError<TValues> | undefined {
  if (error?.fields === undefined) {
    return error;
  }
  const fields = { ...error.fields };
  delete fields[name];
  return { ...error, fields };
}

function asyncStateFor<TValues extends object>(
  context: FormContext<TValues>,
  deps: FormDeps<TValues>,
  name: keyof TValues,
  value: TValues[keyof TValues],
): AsyncFieldState | undefined {
  if (deps.fields?.[name]?.validateAsync === undefined || value === initialOf(context, deps.initialValues)[name]) {
    return undefined;
  }
  return { value, feedback: context.async[name]?.feedback, pending: true };
}

export function formImplementations<TValues extends object>(deps: FormDeps<TValues>) {
  const { assign } = setup<FormContext<TValues>, FormEvent<TValues>>();

  return {
    guards: {
      invalid: (context: FormContext<TValues>) => !isValid(context, deps.fields, deps.canSubmit),
    },
    actions: {
      change: assign((context, _event, { name, value }: { name: keyof TValues; value: TValues[keyof TValues] }) => ({
        values: { ...context.values, [name]: value },
        async: { ...context.async, [name]: asyncStateFor(context, deps, name, value) },
        error: withoutField(context.error, name),
        submitQueued: false,
      })),
      reset: assign((_context, _event, { values }: { values: TValues | undefined }) => ({
        values: values ?? deps.initialValues,
        baseline: values,
        touched: {},
        async: {},
        error: undefined,
        submitQueued: false,
      })),
      setError: assign((context, _event, { cause }: { cause: unknown }) => ({
        error: toFormError(cause, context, deps),
      })),
    },
    actors: {
      submit: (context: FormContext<TValues>) => deps.onSubmit(context.values),
    },
  };
}

export function createFormMachine<TValues extends object>(deps: FormDeps<TValues>) {
  const base = setup<FormContext<TValues>, FormEvent<TValues>>();
  const { assign } = base;
  const { createMachine } = base.extend(formImplementations(deps));
  const touchAll = (context: FormContext<TValues>) => mapKeys(context.values, (): true => true);

  return createMachine({
    id: 'form',
    initial: 'editing',
    context: {
      values: deps.initialValues,
      baseline: undefined,
      touched: {},
      async: {},
      error: undefined,
      submitQueued: false,
    },
    states: {
      editing: {
        on: {
          CHANGE: { actions: { type: 'change', params: (_, event) => ({ name: event.name, value: event.value }) } },
          TOUCH: { actions: assign((context, event) => ({ touched: { ...context.touched, [event.name]: true } })) },
          VALIDATED: {
            guard: (context, event) => context.async[event.name]?.value === event.value,
            actions: assign((context, event) => ({
              async: {
                ...context.async,
                [event.name]: { value: event.value, feedback: event.feedback, pending: false },
              },
            })),
          },
          SUBMIT: [
            {
              guard: 'invalid',
              actions: assign(context => ({ touched: touchAll(context), submitQueued: false })),
            },
            {
              guard: context => isValidating(context),
              actions: assign(context => ({ touched: touchAll(context), submitQueued: true })),
            },
            {
              target: 'submitting',
              actions: assign(context => ({ touched: touchAll(context), submitQueued: false, error: undefined })),
            },
          ],
          RESET: { actions: { type: 'reset', params: (_, event) => ({ values: event.values }) } },
        },
      },
      submitting: {
        invoke: {
          src: 'submit',
          onDone: 'editing',
          onError: {
            target: 'editing',
            actions: { type: 'setError', params: (_, event) => ({ cause: event.error }) },
          },
        },
      },
    },
  });
}

export type FormMachine<TValues extends object> = ReturnType<typeof createFormMachine<TValues>>;
