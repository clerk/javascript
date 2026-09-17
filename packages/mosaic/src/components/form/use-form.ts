import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { useMessages } from '../../localization';
import type { StateMachine } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import type { FormContext, FormEvent } from './form.machine';
import { createFormMachine } from './form.machine';
import type { FieldFeedback } from './form-submit-error';

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

export interface UseFormOptions<TValues extends object> {
  initialValues: TValues;
  fields?: FieldsConfig<TValues>;
  onSubmit: (values: TValues) => Promise<unknown>;
  canSubmit?: (values: TValues) => boolean;
}

export interface FormField {
  feedback: FieldFeedback | undefined;
  isValidating: boolean;
  touched: boolean;
}

export interface UseFormResult<TValues extends object> {
  id: string;
  values: TValues;
  fields: Record<keyof TValues, FormField>;
  error: string | undefined;
  isSubmitting: boolean;
  canSubmit: boolean;
  setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
  touch: (name: keyof TValues) => void;
  submit: () => void;
  reset: (values?: TValues) => void;
}

interface AsyncFieldState {
  value: unknown;
  feedback: FieldFeedback | undefined;
  pending: boolean;
}

type AsyncState<TValues extends object> = Partial<Record<keyof TValues, AsyncFieldState>>;
type Touched<TValues extends object> = Partial<Record<keyof TValues, true>>;

const always = () => true;

function keysOf<T extends object>(value: T): (keyof T)[];
function keysOf(value: object): string[] {
  return Object.keys(value);
}

function mapKeys<T extends object, U>(value: T, fn: (key: keyof T) => U): Record<keyof T, U>;
function mapKeys(value: object, fn: (key: string) => unknown): Record<string, unknown> {
  return Object.fromEntries(Object.keys(value).map(key => [key, fn(key)]));
}

function runSyncValidator<TValues extends object, K extends keyof TValues>(
  fields: FieldsConfig<TValues> | undefined,
  name: K,
  values: TValues,
): FieldFeedback | undefined {
  return fields?.[name]?.validate?.(values[name], values);
}

function rawFeedback<TValues extends object>(
  fields: FieldsConfig<TValues> | undefined,
  name: keyof TValues,
  values: TValues,
  submitErrors: Partial<Record<keyof TValues, string>> | undefined,
  async: AsyncState<TValues>,
): FieldFeedback | undefined {
  const submitError = submitErrors?.[name];
  if (submitError !== undefined) {
    return { type: 'error', message: submitError };
  }
  return runSyncValidator(fields, name, values) ?? async[name]?.feedback;
}

function isBlocked<TValues extends object>(
  fields: FieldsConfig<TValues> | undefined,
  values: TValues,
  async: AsyncState<TValues>,
): boolean {
  return keysOf(values).some(name => {
    const state = async[name];
    return state?.pending === true || rawFeedback(fields, name, values, undefined, async)?.type === 'error';
  });
}

export function useForm<TValues extends object>(options: UseFormOptions<TValues>): UseFormResult<TValues> {
  const id = useId();
  const m = useMessages('form');
  const [touched, setTouched] = useState<Touched<TValues>>({});
  const [async, setAsync] = useState<AsyncState<TValues>>({});
  const asyncRef = useRef(async);
  asyncRef.current = async;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const canSubmitValues = useCallback((values: TValues) => {
    const { fields, canSubmit = always } = optionsRef.current;
    return canSubmit(values) && !isBlocked(fields, values, asyncRef.current);
  }, []);

  const deps: Omit<FormContext<TValues>, 'values' | 'error'> = {
    initialValues: options.initialValues,
    onSubmit: options.onSubmit,
    canSubmit: canSubmitValues,
    fallbackMessage: m.error,
  };
  const machineRef = useRef<StateMachine<FormContext<TValues>, FormEvent<TValues>> | null>(null);
  if (machineRef.current === null) {
    machineRef.current = createFormMachine({ ...deps, values: options.initialValues, error: undefined });
  }
  const [snapshot, send] = useMachine(machineRef.current, { context: deps });
  const { values } = snapshot.context;

  useEffect(() => {
    const { fields, initialValues } = optionsRef.current;
    for (const name of keysOf(values)) {
      const validateAsync = fields?.[name]?.validateAsync;
      const value = values[name];
      if (validateAsync === undefined || asyncRef.current[name]?.value === value) {
        continue;
      }
      if (value === initialValues[name]) {
        setAsync(current => ({ ...current, [name]: undefined }));
        continue;
      }
      setAsync(current => ({ ...current, [name]: { value, feedback: undefined, pending: true } }));
      void validateAsync(value, values).then(feedback => {
        setAsync(current =>
          current[name]?.value === value ? { ...current, [name]: { value, feedback, pending: false } } : current,
        );
      });
    }
  }, [values]);

  const setValue = useCallback(
    <K extends keyof TValues>(name: K, value: TValues[K]) => send({ type: 'CHANGE', name, value }),
    [send],
  );
  const touch = useCallback((name: keyof TValues) => setTouched(current => ({ ...current, [name]: true })), []);
  const submit = useCallback(() => {
    setTouched(mapKeys(optionsRef.current.initialValues, () => true));
    send({ type: 'SUBMIT' });
  }, [send]);
  const reset = useCallback(
    (nextValues?: TValues) => {
      setTouched({});
      setAsync({});
      send({ type: 'RESET', values: nextValues });
    },
    [send],
  );

  const isSubmitting = snapshot.value === 'submitting';
  const fields = mapKeys(values, (name): FormField => {
    const feedback = rawFeedback(options.fields, name, values, snapshot.context.error?.fields, async);
    const isTouched = touched[name] === true;
    return {
      feedback: feedback?.type === 'error' && !isTouched ? undefined : feedback,
      isValidating: async[name]?.pending === true,
      touched: isTouched,
    };
  });

  return {
    id,
    values,
    fields,
    error: snapshot.context.error?.message,
    isSubmitting,
    canSubmit: !isSubmitting && canSubmitValues(values),
    setValue,
    touch,
    submit,
    reset,
  };
}
