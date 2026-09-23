import { useCallback, useId, useRef } from 'react';

import { useMessages } from '../../localization';
import type { StateMachine } from '../../machine/types';
import { useMachine } from '../../machine/useMachine';
import { keysOf, mapKeys } from '../../utils/object';
import type { FieldsConfig, FormContext, FormEvent } from './form.machine';
import { createFormMachine, fieldFeedback, firstInvalid, initialOf, isSubmittable } from './form.machine';
import type { FieldFeedback } from './form-submit-error';

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

type ElementRef = (element: HTMLElement | null) => void;

const always = () => true;

export function useForm<TValues extends object>(options: UseFormOptions<TValues>): UseFormResult<TValues> {
  const id = useId();
  const m = useMessages('form');
  const elements = useRef(new Map<keyof TValues, HTMLElement>());
  const refs = useRef(new Map<keyof TValues, ElementRef>());

  const deps = {
    initialValues: options.initialValues,
    fields: options.fields,
    onSubmit: options.onSubmit,
    canSubmit: options.canSubmit ?? always,
    fallbackMessage: m.error,
  };
  const machineRef = useRef<StateMachine<FormContext<TValues>, FormEvent<TValues>> | null>(null);
  if (machineRef.current === null) {
    machineRef.current = createFormMachine(deps);
  }
  const [snapshot, send, actor] = useMachine(machineRef.current, { context: deps });
  const { context } = snapshot;
  const { values } = context;

  const setValue = useCallback(
    <K extends keyof TValues>(name: K, value: TValues[K]) => {
      send({ type: 'CHANGE', name, value });
      const { async, fields, values: next } = actor.getSnapshot().context;
      const validateAsync = fields?.[name]?.validateAsync;
      if (validateAsync === undefined || async[name]?.pending !== true || async[name].value !== value) {
        return;
      }
      void validateAsync(value, next).then(feedback => send({ type: 'VALIDATED', name, value, feedback }));
    },
    [actor, send],
  );
  const touch = useCallback((name: keyof TValues) => send({ type: 'TOUCH', name }), [send]);
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
    send({ type: 'SUBMIT' });
    const invalid = firstInvalid(actor.getSnapshot().context);
    if (invalid !== undefined) {
      elements.current.get(invalid)?.focus();
    }
  }, [actor, send]);
  const handleSubmit = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );
  const reset = useCallback((nextValues?: TValues) => send({ type: 'RESET', values: nextValues }), [send]);

  const register = <K extends TextFieldName<TValues>>(name: K): RegisteredField<TValues, K> => ({
    name,
    value: values[name],
    onChange: event => setValue(name, event.target.value),
    onBlur: () => touch(name),
    ref: refFor(name),
  });

  const isSubmitting = snapshot.value === 'submitting';
  const initial = initialOf(context);
  const fields = mapKeys(values, (name): FormField => {
    const feedback = fieldFeedback(context, name);
    const touched = context.touched[name] === true;
    return {
      feedback: feedback?.type === 'error' && !touched ? undefined : feedback,
      isValidating: context.async[name]?.pending === true,
      touched,
      isDirty: !Object.is(values[name], initial[name]),
    };
  });

  return {
    id,
    values,
    fields,
    error: context.error?.message,
    isSubmitting,
    isDirty: keysOf(values).some(name => fields[name].isDirty),
    canSubmit: !isSubmitting && isSubmittable(context),
    register,
    setValue,
    touch,
    submit,
    handleSubmit,
    reset,
  };
}
