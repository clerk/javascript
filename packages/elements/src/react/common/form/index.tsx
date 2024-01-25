import type {
  FormControlProps,
  FormFieldProps,
  FormLabelProps,
  FormMessageProps,
  FormProps,
} from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  FormMessage,
  Label as RadixLabel,
  Submit,
} from '@radix-ui/react-form';
import type { ComponentProps, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import type { BaseActorRef } from 'xstate';

import type { ClerkElementsError } from '~/internals/errors/error';
import {
  fieldErrorsSelector,
  fieldHasValueSelector,
  fieldValueSelector,
  globalErrorsSelector,
  useFormSelector,
  useFormStore,
} from '~/internals/machines/form/form.context';
import type { FieldDetails } from '~/internals/machines/form/form.types';

import type { OTPInputProps } from './otp';
import { OTPInput } from './otp';
import type { FieldStates } from './types';

const FieldContext = createContext<Pick<FieldDetails, 'name'> | null>(null);
const useFieldContext = () => useContext(FieldContext);

/**
 * Provides the form submission handler along with the form's validity via a data attribute
 */
const useForm = ({ flowActor }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> }) => {
  const error = useFormSelector(globalErrorsSelector);
  const validity = error ? 'invalid' : 'valid';

  // Register the onSubmit handler for form submission
  // TODO: merge user-provided submit handler
  const onSubmit = useCallback(
    (event: React.FormEvent<Element>) => {
      event.preventDefault();
      if (flowActor) {
        flowActor.send({ type: 'SUBMIT' });
      }
    },
    [flowActor],
  );

  return {
    props: {
      [`data-${validity}`]: true,
      onSubmit,
    },
  };
};

const useField = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const hasValue = useFormSelector(fieldHasValueSelector(name));
  const error = useFormSelector(fieldErrorsSelector(name));

  const shouldBeHidden = false; // TODO: Implement clerk-js utils
  const hasError = Boolean(error);
  const validity = hasError ? 'invalid' : 'valid';

  return {
    hasValue,
    props: {
      [`data-${validity}`]: true,
      'data-hidden': shouldBeHidden ? true : undefined,
      serverInvalid: hasError,
      tabIndex: shouldBeHidden ? -1 : 0,
    },
  };
};

const useGlobalErrors = () => {
  const errors = useFormSelector(globalErrorsSelector);

  return {
    errors,
  };
};

/**
 * Provides field-error/message-specific props based on the field's type/state
 */
const useFieldErrors = ({ name }: Partial<Pick<FieldDetails, 'name'>>) => {
  const errors = useFormSelector(fieldErrorsSelector(name));

  return {
    errors,
  };
};

const determineInputTypeFromName = (name: string) => {
  if (name === 'password') return 'password' as const;
  if (name === 'email') return 'email' as const;
  if (name === 'phone') return 'tel' as const;
  if (name === 'code') return 'otp' as const;

  return 'text' as const;
};

const useInput = ({ name: inputName, value: initialValue, type: inputType, ...passthroughProps }: ClerkInputProps) => {
  // Inputs can be used outside of a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const name = inputName || fieldContext?.name;
  const onChangeProp = passthroughProps?.onChange;

  const ref = useFormStore();
  const value = useFormSelector(fieldValueSelector(name));
  const hasValue = Boolean(value);

  // Register the field in the machine context
  useEffect(() => {
    if (!name || ref.getSnapshot().context.fields.get(name)) return;

    ref.send({ type: 'FIELD.ADD', field: { name, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (!name) return;
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value } });
    },
    [ref, name, onChangeProp],
  );

  if (!name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;
  const type = inputType ?? determineInputTypeFromName(name);

  const Element = inputType === 'otp' ? OTPInput : RadixControl;

  let props = {};
  if (inputType === 'otp') {
    props = {
      'data-otp-input': true,
      autoComplete: 'one-time-code',
      inputMode: 'numeric',
      pattern: '[0-9]*',
      maxLength: 6,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        // Only accept numbers
        event.currentTarget.value = event.currentTarget.value.replace(/\D+/g, '');
        onChange(event);
      },
    };
  }

  return {
    Element,
    props: {
      type,
      value: value ?? '',
      onChange,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
      ...props,
      ...passthroughProps,
    },
  };
};

function Form({ flowActor, ...props }: { flowActor?: BaseActorRef<{ type: 'SUBMIT' }> } & FormProps) {
  const form = useForm({ flowActor: flowActor });

  return (
    <RadixForm
      {...form.props}
      {...props}
    />
  );
}

function Field(props: FormFieldProps) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <InnerField {...props} />
    </FieldContext.Provider>
  );
}

function InnerField(props: FormFieldProps) {
  const field = useField({ name: props.name });

  return (
    <RadixField
      {...field.props}
      {...props}
    />
  );
}

/**
 * A helper to access the state of the field programmatically. This can be useful if you need to trigger
 * animations or certain behavior based on the field's state independent of the existing components.
 */
function FieldState({ children }: { children: (state: { state: FieldStates }) => ReactNode }) {
  const field = useFieldContext();
  const error = useFormSelector(fieldErrorsSelector(field?.name));
  const state = error ? ('invalid' as const) : ('valid' as const);

  const fieldState = { state };

  return children(fieldState);
}

type ClerkInputProps = FormControlProps | ({ type: 'otp' } & OTPInputProps);

function Input(props: ClerkInputProps) {
  const field = useInput(props);

  return <field.Element {...field.props} />;
}

function Label(props: FormLabelProps) {
  return <RadixLabel {...props} />;
}

// ================= ERRORS ================= //

type FormErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
type FormErrorProps<T> = Omit<T, 'asChild' | 'children'> &
  (
    | {
        children?: (error: FormErrorRenderProps) => React.ReactNode;
        code?: string;
      }
    | {
        children: React.ReactNode;
        code: string;
      }
  );

type FormGlobalErrorProps = FormErrorProps<ComponentProps<'span'>>;
type FormFieldErrorProps = FormErrorProps<FormMessageProps & { name?: string }>;

function GlobalError({ children, code, ...rest }: FormGlobalErrorProps) {
  const { errors } = useGlobalErrors();

  const error = errors?.[0];

  if (!error || (code && error.code !== code)) {
    return null;
  }

  const child = typeof children === 'function' ? children(error) : children;

  return (
    <span
      role='alert'
      {...rest}
    >
      {child || error.message}
    </span>
  );
}

function FieldError({ children, code, name, ...rest }: FormFieldErrorProps) {
  const fieldContext = useFieldContext();
  const fieldName = fieldContext?.name || name;
  const { errors } = useFieldErrors({ name: fieldName });

  const error = errors?.[0];

  if (!error) {
    return null;
  }

  const child = typeof children === 'function' ? children(error) : children;
  const forceMatch = code ? error.code === code : true;

  return (
    <FormMessage
      data-error-code={error.code}
      forceMatch={forceMatch}
      {...rest}
    >
      {child || error.message}
    </FormMessage>
  );
}

export { Field, FieldError, FieldState, Form, GlobalError, Input, Label, Submit };
export type {
  FormControlProps,
  FormErrorProps,
  FormGlobalErrorProps,
  FormErrorRenderProps,
  FormFieldErrorProps,
  FormFieldProps,
  FormProps,
};
