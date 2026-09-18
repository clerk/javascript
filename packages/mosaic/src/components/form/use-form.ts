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
  isDirty: boolean;
}

export type TextFieldName<TValues extends object> = {
  [K in keyof TValues]: string extends TValues[K] ? K : never;
}[keyof TValues] &
  string;

export interface RegisteredField<TValues extends object, K extends keyof TValues> {
  name: K;
  value: TValues[K];
  onChange: (event: { target: { value: TValues[K] } }) => void;
  onBlur: () => void;
  ref: (element: HTMLElement | null) => void;
}

export interface UseFormResult<TValues extends object> {
  id: string;
  values: TValues;
  fields: Record<keyof TValues, FormField>;
  error: string | undefined;
  isSubmitting: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  register: <K extends TextFieldName<TValues>>(name: K) => RegisteredField<TValues, K>;
  setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
  touch: (name: keyof TValues) => void;
  submit: () => void;
  handleSubmit: (event: { preventDefault: () => void }) => void;
  reset: (values?: TValues) => void;
}

interface AsyncFieldState {
  value: unknown;
  feedback: FieldFeedback | undefined;
  pending: boolean;
}

type AsyncState<TValues extends object> = Partial<Record<keyof TValues, AsyncFieldState>>;
type Touched<TValues extends object> = Partial<Record<keyof TValues, true>>;
type ElementRef = (element: HTMLElement | null) => void;

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

function firstInvalid<TValues extends object>(
  fields: FieldsConfig<TValues> | undefined,
  values: TValues,
  async: AsyncState<TValues>,
): keyof TValues | undefined {
  return keysOf(values).find(name => rawFeedback(fields, name, values, undefined, async)?.type === 'error');
}

function isBlocked<TValues extends object>(
  fields: FieldsConfig<TValues> | undefined,
  values: TValues,
  async: AsyncState<TValues>,
): boolean {
  return (
    keysOf(values).some(name => async[name]?.pending === true) || firstInvalid(fields, values, async) !== undefined
  );
}

export function useForm<TValues extends object>(options: UseFormOptions<TValues>): UseFormResult<TValues> {
  const id = useId();
  const m = useMessages('form');
  const [touched, setTouched] = useState<Touched<TValues>>({});
  const [async, setAsync] = useState<AsyncState<TValues>>({});
  const [baseline, setBaseline] = useState<TValues | undefined>(undefined);
  const initial = baseline ?? options.initialValues;
  const asyncRef = useRef(async);
  asyncRef.current = async;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const initialRef = useRef(initial);
  initialRef.current = initial;
  const elements = useRef(new Map<keyof TValues, HTMLElement>());
  const refs = useRef(new Map<keyof TValues, ElementRef>());

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
  const [snapshot, send, actor] = useMachine(machineRef.current, { context: deps });
  const { values } = snapshot.context;

  useEffect(() => {
    const { fields } = optionsRef.current;
    for (const name of keysOf(values)) {
      const validateAsync = fields?.[name]?.validateAsync;
      const value = values[name];
      if (validateAsync === undefined || asyncRef.current[name]?.value === value) {
        continue;
      }
      if (value === initialRef.current[name]) {
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
  const refFor = useCallback((name: keyof TValues): ElementRef => {
    const existing = refs.current.get(name);
    if (existing !== undefined) {
      return existing;
    }
    const ref: ElementRef = element => {
      if (element === null) {
        elements.current.delete(name);
      } else {
        elements.current.set(name, element);
      }
    };
    refs.current.set(name, ref);
    return ref;
  }, []);
  const submit = useCallback(() => {
    const { fields, initialValues } = optionsRef.current;
    setTouched(mapKeys(initialValues, () => true));
    const invalid = firstInvalid(fields, actor.getSnapshot().context.values, asyncRef.current);
    if (invalid !== undefined) {
      elements.current.get(invalid)?.focus();
      return;
    }
    send({ type: 'SUBMIT' });
  }, [actor, send]);
  const handleSubmit = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );
  const reset = useCallback(
    (nextValues?: TValues) => {
      setTouched({});
      setAsync({});
      setBaseline(nextValues);
      send({ type: 'RESET', values: nextValues });
    },
    [send],
  );

  const register = <K extends TextFieldName<TValues>>(name: K): RegisteredField<TValues, K> => ({
    name,
    value: values[name],
    onChange: event => setValue(name, event.target.value),
    onBlur: () => touch(name),
    ref: refFor(name),
  });

  const isSubmitting = snapshot.value === 'submitting';
  const fields = mapKeys(values, (name): FormField => {
    const feedback = rawFeedback(options.fields, name, values, snapshot.context.error?.fields, async);
    const isTouched = touched[name] === true;
    return {
      feedback: feedback?.type === 'error' && !isTouched ? undefined : feedback,
      isValidating: async[name]?.pending === true,
      touched: isTouched,
      isDirty: !Object.is(values[name], initial[name]),
    };
  });

  return {
    id,
    values,
    fields,
    error: snapshot.context.error?.message,
    isSubmitting,
    isDirty: keysOf(values).some(name => fields[name].isDirty),
    canSubmit: !isSubmitting && canSubmitValues(values),
    register,
    setValue,
    touch,
    submit,
    handleSubmit,
    reset,
  };
}
