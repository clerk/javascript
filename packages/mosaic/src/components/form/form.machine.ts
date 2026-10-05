import type { LocalizableError } from '../../localization';
import { setup } from '../../machine/setup';
import type { TransitionResult } from '../../machine/types';
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
  options: { signal: AbortSignal },
) => Promise<FieldFeedback | undefined>;

export interface FieldConfig<TValue, TValues extends object> {
  validate?: FieldValidator<TValue, TValues>;
  validateAsync?: AsyncFieldValidator<TValue, TValues>;
  debounceMs?: number;
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

export interface FormContext<TValues extends object> extends FormDeps<TValues> {
  values: TValues;
  baseline: TValues | undefined;
  touched: Partial<Record<keyof TValues, true>>;
  async: Partial<Record<keyof TValues, AsyncFieldState>>;
  error: FormError<TValues> | undefined;
}

export type FormEvent<TValues extends object> =
  | { type: 'CHANGE'; name: keyof TValues; value: TValues[keyof TValues] }
  | { type: 'TOUCH'; name: keyof TValues }
  | { type: 'VALIDATED'; name: keyof TValues; value: unknown; feedback: FieldFeedback | undefined }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; values?: TValues };

export function initialOf<TValues extends object>(context: FormContext<TValues>): TValues {
  return context.baseline ?? context.initialValues;
}

function syncFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  return context.fields?.[name]?.validate?.(context.values[name], context.values);
}

function blockingFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  const submitError = context.error?.fields?.[name];
  return submitError === undefined ? syncFeedback(context, name) : { type: 'error', message: submitError };
}

export function fieldFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  const feedback = blockingFeedback(context, name);
  const hidden = feedback?.type === 'error' && context.touched[name] !== true;
  return (hidden ? undefined : feedback) ?? context.async[name]?.feedback;
}

export function firstInvalid<TValues extends object>(context: FormContext<TValues>): keyof TValues | undefined {
  return keysOf(context.values).find(name => syncFeedback(context, name)?.type === 'error');
}

export function isValid<TValues extends object>(context: FormContext<TValues>): boolean {
  return context.canSubmit(context.values) && firstInvalid(context) === undefined;
}

function submitOrStay<TValues extends object>(
  context: FormContext<TValues>,
  patch: Partial<FormContext<TValues>>,
): TransitionResult<FormContext<TValues>, FormState> {
  if (!isValid({ ...context, ...patch })) {
    return { context: patch };
  }
  return { target: 'submitting', context: { ...patch, error: undefined } };
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
): FormFieldErrors<TValues> {
  const result: FormFieldErrors<TValues> = {};
  for (const name of keysOf(context.values)) {
    const error = typeof name === 'string' ? fields?.[name] : undefined;
    if (error !== undefined) {
      result[name] = context.errorText(error);
    }
  }
  return result;
}

function toFormError<TValues extends object>(cause: unknown, context: FormContext<TValues>): FormError<TValues> {
  if (!(cause instanceof FormSubmitError) && !(cause instanceof SaveError)) {
    console.error(cause);
    return { message: context.fallbackMessage };
  }
  const error: FormError<TValues> =
    cause instanceof FormSubmitError
      ? { message: cause.banner, fields: displayableFields(context, cause.fields) }
      : {
          message: cause.formError.global ? context.errorText(cause.formError.global) : undefined,
          fields: savedFieldErrors(context, cause.formError.fields),
        };
  const visible = (error.message ?? '') !== '' || keysOf(error.fields ?? {}).length > 0;
  return visible ? error : { ...error, message: context.fallbackMessage };
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
  name: keyof TValues,
): AsyncFieldState | undefined {
  const value = context.values[name];
  const current = context.async[name];
  if (
    context.fields?.[name]?.validateAsync === undefined ||
    (value === initialOf(context)[name] && context.touched[name] !== true)
  ) {
    return undefined;
  }
  if (current?.value === value) {
    return current;
  }
  return { value, feedback: current?.feedback, pending: true };
}

function withAsyncState<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): Partial<Record<keyof TValues, AsyncFieldState>> {
  return { ...context.async, [name]: asyncStateFor(context, name) };
}

type FormState = 'editing' | 'submitting';

export function createFormMachine<TValues extends object>(deps: FormDeps<TValues>) {
  const { createMachine, assign, fromPromise } = setup<FormContext<TValues>, FormEvent<TValues>>();

  return createMachine({
    id: 'form',
    initial: 'editing',
    context: {
      ...deps,
      values: deps.initialValues,
      baseline: undefined,
      touched: {},
      async: {},
      error: undefined,
    },
    states: {
      editing: {
        on: {
          CHANGE: ({ context, event }) => {
            const next = { ...context, values: { ...context.values, [event.name]: event.value } };
            return {
              context: {
                values: next.values,
                async: withAsyncState(next, event.name),
                error: withoutField(context.error, event.name),
              },
            };
          },
          TOUCH: ({ context, event }) => {
            const next = { ...context, touched: { ...context.touched, [event.name]: true } };
            return { context: { touched: next.touched, async: withAsyncState(next, event.name) } };
          },
          VALIDATED: ({ context, event }) => {
            if (context.async[event.name]?.value !== event.value) {
              return undefined;
            }
            return {
              context: {
                async: {
                  ...context.async,
                  [event.name]: { value: event.value, feedback: event.feedback, pending: false },
                },
              },
            };
          },
          SUBMIT: ({ context }) => submitOrStay(context, { touched: mapKeys(context.values, (): true => true) }),
          RESET: ({ context, event }) => ({
            context: {
              values: event.values ?? context.initialValues,
              baseline: event.values,
              touched: {},
              async: {},
              error: undefined,
            },
          }),
        },
      },
      submitting: {
        invoke: fromPromise(async ctx => ctx.onSubmit(ctx.values), {
          onDone: 'editing',
          onError: {
            target: 'editing',
            actions: assign((ctx, e) => ({ error: toFormError(e.error, ctx) })),
          },
        }),
      },
    },
  });
}
