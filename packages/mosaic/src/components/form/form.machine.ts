import { setup } from '../../machine/setup';
import { keysOf, mapKeys } from '../../utils/object';
import type { FieldFeedback, FormError } from './form-submit-error';
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

export function validatorFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  return context.fields?.[name]?.validate?.(context.values[name], context.values) ?? context.async[name]?.feedback;
}

export function fieldFeedback<TValues extends object>(
  context: FormContext<TValues>,
  name: keyof TValues,
): FieldFeedback | undefined {
  const submitError = context.error?.fields?.[name];
  return submitError === undefined ? validatorFeedback(context, name) : { type: 'error', message: submitError };
}

export function firstInvalid<TValues extends object>(context: FormContext<TValues>): keyof TValues | undefined {
  return keysOf(context.values).find(name => validatorFeedback(context, name)?.type === 'error');
}

export function isSubmittable<TValues extends object>(context: FormContext<TValues>): boolean {
  return (
    context.canSubmit(context.values) &&
    !keysOf(context.values).some(name => context.async[name]?.pending === true) &&
    firstInvalid(context) === undefined
  );
}

function toFormError<TValues extends object>(cause: unknown, fallbackMessage: string): FormError<TValues> {
  if (cause instanceof FormSubmitError) {
    return { message: cause.message, fields: cause.fields };
  }
  if (cause instanceof Error) {
    return { message: cause.message };
  }
  return { message: fallbackMessage };
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
  return { value, feedback: undefined, pending: true };
}

export function createFormMachine<TValues extends object>(deps: FormDeps<TValues>) {
  const { createMachine, assign, fromPromise } = setup<FormContext<TValues>, FormEvent<TValues>>();

  return createMachine({
    id: 'form',
    initial: 'editing',
    context: { ...deps, values: deps.initialValues, baseline: undefined, touched: {}, async: {}, error: undefined },
    states: {
      editing: {
        on: {
          CHANGE: ({ context, event }) => ({
            context: {
              values: { ...context.values, [event.name]: event.value },
              async: { ...context.async, [event.name]: asyncStateFor(context, event.name, event.value) },
              error: withoutField(context.error, event.name),
            },
          }),
          TOUCH: ({ context, event }) => ({ context: { touched: { ...context.touched, [event.name]: true } } }),
          VALIDATED: ({ context, event }) =>
            context.async[event.name]?.value === event.value
              ? {
                  context: {
                    async: {
                      ...context.async,
                      [event.name]: { value: event.value, feedback: event.feedback, pending: false },
                    },
                  },
                }
              : undefined,
          SUBMIT: ({ context }) => {
            const touched = mapKeys(context.values, (): true => true);
            return isSubmittable(context)
              ? { target: 'submitting', context: { touched, error: undefined } }
              : { context: { touched } };
          },
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
        invoke: fromPromise(ctx => ctx.onSubmit(ctx.values), {
          onDone: 'editing',
          onError: {
            target: 'editing',
            actions: assign((ctx, e) => ({ error: toFormError(e.error, ctx.fallbackMessage) })),
          },
        }),
      },
    },
  });
}
