import { useCallback, useEffect, useId, useRef } from 'react';

import { useErrorText, useMessages } from '../../localization';
import type { StateMachine } from '../../machine/types';
import { useMachine } from '../../machine/use-machine';
import { keysOf, mapKeys } from '../../utils/object';
import type { FieldsConfig, FormContext, FormEvent } from './form.machine';
import { createFormMachine, fieldFeedback, firstInvalid, initialOf, isValid } from './form.machine';
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

export interface RegisteredValueField<TValues extends object, K extends keyof TValues> {
  name: K;
  value: TValues[K];
  onValueChange: (value: TValues[K]) => void;
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
  /**
   * Props for a control that takes `onChange(event)`, such as `<input>` or `<textarea>`.
   * Wires `value`, `onChange`, `onBlur` and `ref`. Accepts only string fields. For a
   * control that takes `onValueChange(value)`, use `registerValue`.
   *
   * @example
   * <InputGroup.Input {...form.register('username')} />
   */
  register: <K extends TextFieldName<TValues>>(name: K) => RegisteredField<TValues, K>;
  /**
   * Props for a control that takes `onValueChange(value)`, such as `PhoneInput` or `OTP`.
   * Wires `value`, `onValueChange`, `onBlur` and `ref`. Passes the value through unchanged,
   * so it accepts a field of any type. For a control that takes `onChange(event)`, use
   * `register`.
   *
   * @example
   * <PhoneInput {...form.registerValue('phoneNumber')} />
   */
  registerValue: <K extends keyof TValues>(name: K) => RegisteredValueField<TValues, K>;
  setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
  touch: (name: keyof TValues) => void;
  submit: () => void;
  handleSubmit: (event: { preventDefault: () => void }) => void;
  reset: (values?: TValues) => void;
}

type ElementRef = (element: HTMLElement | null) => void;

interface Check {
  controller: AbortController;
  flush: () => void;
}

const always = () => true;

export function useForm<TValues extends object>(options: UseFormOptions<TValues>): UseFormResult<TValues> {
  const id = useId();
  const m = useMessages('form');
  const errorText = useErrorText();
  const elements = useRef(new Map<keyof TValues, HTMLElement>());
  const refs = useRef(new Map<keyof TValues, ElementRef>());
  const checks = useRef(new Map<keyof TValues, Check>());

  const deps = {
    initialValues: options.initialValues,
    fields: options.fields,
    onSubmit: options.onSubmit,
    canSubmit: options.canSubmit ?? always,
    fallbackMessage: m.error,
    errorText,
  };
  const machineRef = useRef<StateMachine<FormContext<TValues>, FormEvent<TValues>> | null>(null);
  if (machineRef.current === null) {
    machineRef.current = createFormMachine(deps);
  }
  const [snapshot, send, actor] = useMachine(machineRef.current, { context: deps });
  const context = { ...snapshot.context, ...deps };
  const { values } = context;

  const focusFirstInvalid = useCallback(() => {
    const invalid = firstInvalid(actor.getSnapshot().context);
    if (invalid !== undefined) {
      elements.current.get(invalid)?.focus();
    }
  }, [actor]);
  const cancelCheck = useCallback((name: keyof TValues) => {
    const check = checks.current.get(name);
    checks.current.delete(name);
    check?.controller.abort();
    check?.flush();
  }, []);
  const cancelChecks = useCallback(() => {
    for (const name of checks.current.keys()) {
      cancelCheck(name);
    }
  }, [cancelCheck]);
  useEffect(() => cancelChecks, [cancelChecks]);

  const startCheck = useCallback(
    (name: keyof TValues, debounceMs: number) => {
      const { async, fields, values: current, fallbackMessage } = actor.getSnapshot().context;
      const validateAsync = fields?.[name]?.validateAsync;
      if (validateAsync === undefined || async[name]?.pending !== true) {
        return;
      }
      const value = current[name];
      const controller = new AbortController();
      const failure: FieldFeedback = { type: 'error', message: fallbackMessage };
      const checked = new Promise<FieldFeedback | undefined>(resolve => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let started = false;
        const flush = () => {
          clearTimeout(timer);
          if (started) {
            return;
          }
          started = true;
          if (controller.signal.aborted) {
            resolve(undefined);
            return;
          }
          try {
            resolve(validateAsync(value, current, { signal: controller.signal }));
          } catch {
            resolve(failure);
          }
        };
        checks.current.set(name, { controller, flush });
        if (debounceMs > 0) {
          timer = setTimeout(flush, debounceMs);
        } else {
          flush();
        }
      });
      const settle = (feedback: FieldFeedback | undefined) => {
        if (controller.signal.aborted) {
          return;
        }
        checks.current.delete(name);
        send({ type: 'VALIDATED', name, value, feedback });
      };
      void checked.then(settle, () => settle(failure));
    },
    [actor, send],
  );
  const followCheck = useCallback(
    (name: keyof TValues, previous: unknown, debounceMs: number) => {
      if (actor.getSnapshot().context.async[name] === previous) {
        return false;
      }
      cancelCheck(name);
      startCheck(name, debounceMs);
      return true;
    },
    [actor, cancelCheck, startCheck],
  );
  const setValue = useCallback(
    <K extends keyof TValues>(name: K, value: TValues[K]) => {
      const { async, fields } = actor.getSnapshot().context;
      send({ type: 'CHANGE', name, value });
      followCheck(name, async[name], fields?.[name]?.debounceMs ?? 0);
    },
    [actor, followCheck, send],
  );
  const touch = useCallback(
    (name: keyof TValues) => {
      const previous = actor.getSnapshot().context.async[name];
      send({ type: 'TOUCH', name });
      if (!followCheck(name, previous, 0)) {
        checks.current.get(name)?.flush();
      }
    },
    [actor, followCheck, send],
  );
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
    focusFirstInvalid();
  }, [focusFirstInvalid, send]);
  const handleSubmit = useCallback(
    (event: { preventDefault: () => void }) => {
      event.preventDefault();
      submit();
    },
    [submit],
  );
  const reset = useCallback(
    (nextValues?: TValues) => {
      cancelChecks();
      send({ type: 'RESET', values: nextValues });
    },
    [cancelChecks, send],
  );

  const register = <K extends TextFieldName<TValues>>(name: K): RegisteredField<TValues, K> => ({
    name,
    value: values[name],
    onChange: event => setValue(name, event.target.value),
    onBlur: () => touch(name),
    ref: refFor(name),
  });
  const registerValue = <K extends keyof TValues>(name: K): RegisteredValueField<TValues, K> => ({
    name,
    value: values[name],
    onValueChange: value => setValue(name, value),
    onBlur: () => touch(name),
    ref: refFor(name),
  });

  const isSubmitting = snapshot.value === 'submitting';
  const initial = initialOf(context);
  const fields = mapKeys(values, (name): FormField => {
    return {
      feedback: fieldFeedback(context, name),
      isValidating: context.async[name]?.pending === true,
      touched: context.touched[name] === true,
      isDirty: !Object.is(values[name], initial[name]),
    };
  });

  return {
    id,
    values,
    fields,
    error: context.error?.message,
    get isSubmitting() {
      return actor.getSnapshot().value === 'submitting';
    },
    isDirty: keysOf(values).some(name => fields[name].isDirty),
    canSubmit: !isSubmitting && isValid(context),
    register,
    registerValue,
    setValue,
    touch,
    submit,
    handleSubmit,
    reset,
  };
}
