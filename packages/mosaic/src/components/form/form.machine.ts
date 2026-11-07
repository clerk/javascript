import { isReverificationCancelledError } from '@clerk/shared/error';

import type { LocalizableError } from '../../localization';
import { createAsyncLogic, setup } from '../../machine/setup';
import type { ActorRef, AsyncArgs, Enqueue, TransitionResult } from '../../machine/types';
import { keysOf, mapKeys } from '../../primitives/utils/object';
import { SaveError } from '../../utils/errors';
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

export function fieldConfig<TValues extends object, K extends keyof TValues>(
  fields: FieldsConfig<TValues> | undefined,
  name: K,
): FieldConfig<TValues[K], TValues> | undefined {
  return fields?.[name];
}

export interface AsyncFieldState {
  value: unknown;
  feedback: FieldFeedback | undefined;
  pending: boolean;
}

export interface FormDeps<TValues extends object> {
  initialValues: TValues;
  fields: FieldsConfig<TValues> | undefined;
  onSubmit: (values: TValues) => Promise<() => void>;
  canSubmit: (values: TValues) => boolean;
  fallbackMessage: string;
  errorText: (error: LocalizableError) => string;
}

export interface FormMachineContext<TValues extends object> {
  values: TValues;
  baseline: TValues | undefined;
  touched: Partial<Record<keyof TValues, true>>;
  async: Partial<Record<keyof TValues, AsyncFieldState>>;
  error: FormError<TValues> | undefined;
}

export interface FormContext<TValues extends object> extends FormDeps<TValues>, FormMachineContext<TValues> {}

export interface FormImplementations<TValues extends object> {
  deps: FormDeps<TValues>;
  focus: (name: keyof TValues) => void;
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
  return fieldConfig(context.fields, name)?.validate?.(context.values[name], context.values);
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
  patch: Partial<FormMachineContext<TValues>>,
  focus: (name: keyof TValues) => void,
  enq: Enqueue,
): TransitionResult<FormMachineContext<TValues>, FormStep> {
  const next = { ...context, ...patch };
  if (!isValid(next)) {
    const invalid = firstInvalid(next);
    if (invalid !== undefined) {
      enq(focus, invalid);
    }
    return { target: 'editing', context: patch };
  }
  if (isValidating(next)) {
    return { target: 'queued', context: patch };
  }
  return { target: 'submitting', context: patch };
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
    console.error('[Clerk] Could not localize error', cause);
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
  value: TValues[keyof TValues],
): AsyncFieldState | undefined {
  if (fieldConfig(context.fields, name)?.validateAsync === undefined || value === initialOf(context)[name]) {
    return undefined;
  }
  return { value, feedback: context.async[name]?.feedback, pending: true };
}

type FormStep = 'editing' | 'queued' | 'submitting';

export function createFormMachine<TValues extends object>(implementations: FormImplementations<TValues>) {
  const { createMachine } = setup<FormMachineContext<TValues>, FormEvent<TValues>>();
  const { deps } = implementations;

  return createMachine({
    id: 'form',
    initial: 'editing',
    context: {
      values: deps.initialValues,
      baseline: undefined,
      touched: {},
      async: {},
      error: undefined,
    },
    ...formImplementations(implementations),
    states: {
      editing: {
        on: {
          CHANGE: ({ context, event, self, actions }, enq) => ({
            context: changed({ ...context, ...actions.deps() }, event, self, enq),
          }),
          TOUCH: ({ context, event }) => ({ context: touched(context, event) }),
          VALIDATED: ({ context, event }) => {
            const async = validated(context, event);
            return async === undefined ? undefined : { context: { async } };
          },
          SUBMIT: ({ context, actions }, enq) =>
            submitOrStay(
              { ...context, ...actions.deps() },
              { touched: mapKeys(context.values, (): true => true) },
              actions.focus,
              enq,
            ),
          RESET: ({ event, actions }) => ({ context: resetTo(actions.deps(), event) }),
        },
      },
      queued: {
        on: {
          CHANGE: ({ context, event, self, actions }, enq) => ({
            target: 'editing',
            context: changed({ ...context, ...actions.deps() }, event, self, enq),
          }),
          TOUCH: ({ context, event }) => ({ context: touched(context, event) }),
          VALIDATED: ({ context, event, actions }, enq) => {
            const async = validated(context, event);
            return async === undefined
              ? undefined
              : submitOrStay({ ...context, ...actions.deps() }, { async }, actions.focus, enq);
          },
          RESET: ({ event, actions }) => ({ target: 'editing', context: resetTo(actions.deps(), event) }),
        },
      },
      submitting: {
        invoke: {
          src: 'submit',
          input: ({ context }) => context.values,
          onDone: ({ event }, enq) => {
            enq(event.output);
            return { target: 'editing', context: { error: undefined } };
          },
          onError: ({ context, event, actions }) =>
            Boolean(event.error) && isReverificationCancelledError(event.error)
              ? { target: 'editing', context: { error: undefined } }
              : { target: 'editing', context: { error: toFormError(event.error, { ...context, ...actions.deps() }) } },
        },
      },
    },
  });
}

function submitLogic<TValues extends object>(deps: FormDeps<TValues>) {
  return createAsyncLogic(({ input }: AsyncArgs<TValues>) => deps.onSubmit(input));
}

export function formImplementations<TValues extends object>(implementations: FormImplementations<TValues>) {
  return {
    actions: { deps: (): FormDeps<TValues> => implementations.deps, focus: implementations.focus },
    actors: { submit: submitLogic(implementations.deps) },
  };
}

type EventOf<TValues extends object, TType extends FormEvent<TValues>['type']> = Extract<
  FormEvent<TValues>,
  { type: TType }
>;

function changed<TValues extends object>(
  context: FormContext<TValues>,
  event: EventOf<TValues, 'CHANGE'>,
  self: ActorRef<FormMachineContext<TValues>, FormEvent<TValues>>,
  enq: Enqueue,
): Partial<FormMachineContext<TValues>> {
  const values = { ...context.values, [event.name]: event.value };
  const asyncState = asyncStateFor(context, event.name, event.value);
  const validateAsync = fieldConfig(context.fields, event.name)?.validateAsync;
  if (asyncState !== undefined && validateAsync !== undefined) {
    enq(startValidation, self, event, validateAsync, values);
  }
  return {
    values,
    async: { ...context.async, [event.name]: asyncState },
    error: withoutField(context.error, event.name),
  };
}

function startValidation<TValues extends object>(
  self: ActorRef<FormMachineContext<TValues>, FormEvent<TValues>>,
  event: EventOf<TValues, 'CHANGE'>,
  validateAsync: AsyncFieldValidator<TValues[keyof TValues], TValues>,
  values: TValues,
): void {
  const settle = (feedback: FieldFeedback | undefined) =>
    self.send({ type: 'VALIDATED', name: event.name, value: event.value, feedback });
  void new Promise<FieldFeedback | undefined>(resolve => resolve(validateAsync(event.value, values))).then(settle, () =>
    settle(undefined),
  );
}

function touched<TValues extends object>(
  context: FormMachineContext<TValues>,
  event: EventOf<TValues, 'TOUCH'>,
): Partial<FormMachineContext<TValues>> {
  return { touched: { ...context.touched, [event.name]: true } };
}

function validated<TValues extends object>(
  context: FormMachineContext<TValues>,
  event: EventOf<TValues, 'VALIDATED'>,
): FormMachineContext<TValues>['async'] | undefined {
  if (context.async[event.name]?.value !== event.value) {
    return undefined;
  }
  return { ...context.async, [event.name]: { value: event.value, feedback: event.feedback, pending: false } };
}

function resetTo<TValues extends object>(
  deps: FormDeps<TValues>,
  event: EventOf<TValues, 'RESET'>,
): Partial<FormMachineContext<TValues>> {
  return {
    values: event.values ?? deps.initialValues,
    baseline: event.values,
    touched: {},
    async: {},
    error: undefined,
  };
}
