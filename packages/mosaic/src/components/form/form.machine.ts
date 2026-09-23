import { setup } from '../../machine/setup';
import type { TransitionResult } from '../../machine/types';
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
}

export interface FormContext<TValues extends object> extends FormDeps<TValues> {
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

export function initialOf<TValues extends object>(context: FormContext<TValues>): TValues {
  return context.baseline ?? context.initialValues;
}

function syncFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  return context.fields?.[name]?.validate?.(context.values[name], context.values);
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
  name: keyof TValues,
): FieldFeedback | undefined {
  return syncFeedback(context, name) ?? context.async[name]?.feedback;
}

export function fieldFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  const submitError = context.error?.fields?.[name];
  return submitError === undefined ? validatorFeedback(context, name) : { type: 'error', message: submitError };
}

export function firstInvalid<TValues extends object>(context: FormContext<TValues>): keyof TValues | undefined {
  return keysOf(context.values).find(
    name => (syncFeedback(context, name) ?? settledAsyncFeedback(context, name))?.type === 'error',
  );
}

export function isValid<TValues extends object>(context: FormContext<TValues>): boolean {
  return context.canSubmit(context.values) && firstInvalid(context) === undefined;
}

function isValidating<TValues extends object>(context: FormContext<TValues>): boolean {
  return keysOf(context.values).some(name => context.async[name]?.pending === true);
}

function submitOrStay<TValues extends object>(
  context: FormContext<TValues>,
  patch: Partial<FormContext<TValues>>,
): TransitionResult<FormContext<TValues>, FormState> {
  const next = { ...context, ...patch };
  if (!isValid(next)) {
    return { context: { ...patch, submitQueued: false } };
  }
  if (isValidating(next)) {
    return { context: { ...patch, submitQueued: true } };
  }
  return { target: 'submitting', context: { ...patch, submitQueued: false, error: undefined } };
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

function toFormError<TValues extends object>(cause: unknown, context: FormContext<TValues>): FormError<TValues> {
  const error: FormError<TValues> =
    cause instanceof FormSubmitError
      ? { message: cause.banner, fields: displayableFields(context, cause.fields) }
      : cause instanceof Error
        ? { message: cause.message }
        : {};
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
  value: TValues[keyof TValues],
): AsyncFieldState | undefined {
  if (context.fields?.[name]?.validateAsync === undefined || value === initialOf(context)[name]) {
    return undefined;
  }
  return { value, feedback: context.async[name]?.feedback, pending: true };
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
      submitQueued: false,
    },
    states: {
      editing: {
        on: {
          CHANGE: ({ context, event }) => ({
            context: {
              values: { ...context.values, [event.name]: event.value },
              async: { ...context.async, [event.name]: asyncStateFor(context, event.name, event.value) },
              error: withoutField(context.error, event.name),
              submitQueued: false,
            },
          }),
          TOUCH: ({ context, event }) => ({ context: { touched: { ...context.touched, [event.name]: true } } }),
          VALIDATED: ({ context, event }) => {
            if (context.async[event.name]?.value !== event.value) {
              return undefined;
            }
            const async = {
              ...context.async,
              [event.name]: { value: event.value, feedback: event.feedback, pending: false },
            };
            return context.submitQueued ? submitOrStay(context, { async }) : { context: { async } };
          },
          SUBMIT: ({ context }) => submitOrStay(context, { touched: mapKeys(context.values, (): true => true) }),
          RESET: ({ context, event }) => ({
            context: {
              values: event.values ?? context.initialValues,
              baseline: event.values,
              touched: {},
              async: {},
              error: undefined,
              submitQueued: false,
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
