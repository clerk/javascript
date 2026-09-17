import { setup } from '../../machine/setup';
import type { FormError } from './form-submit-error';
import { FormSubmitError } from './form-submit-error';

export interface FormContext<TValues extends object> {
  initialValues: TValues;
  values: TValues;
  error: FormError<TValues> | undefined;
  onSubmit: (values: TValues) => Promise<unknown>;
  canSubmit: (values: TValues) => boolean;
  fallbackMessage: string;
}

export type FormEvent<TValues extends object> =
  | { type: 'CHANGE'; name: keyof TValues; value: TValues[keyof TValues] }
  | { type: 'SUBMIT' }
  | { type: 'RESET'; values?: TValues };

export type FormState = 'editing' | 'submitting';

export function toFormError<TValues extends object>(cause: unknown, fallbackMessage: string): FormError<TValues> {
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

export function createFormMachine<TValues extends object>(context: FormContext<TValues>) {
  const { createMachine, assign, fromPromise } = setup<FormContext<TValues>, FormEvent<TValues>>();

  return createMachine({
    id: 'form',
    initial: 'editing',
    context,
    states: {
      editing: {
        on: {
          CHANGE: {
            actions: assign((ctx, e) => ({
              values: { ...ctx.values, [e.name]: e.value },
              error: withoutField(ctx.error, e.name),
            })),
          },
          SUBMIT: {
            target: 'submitting',
            guard: ctx => ctx.canSubmit(ctx.values),
            actions: assign(() => ({ error: undefined })),
          },
          RESET: {
            actions: assign((ctx, e) => ({ values: e.values ?? ctx.initialValues, error: undefined })),
          },
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
