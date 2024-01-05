import type { FormControlProps, FormFieldProps, FormLabelProps, FormProps } from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  Label as RadixLabel,
  Message as RadixMessage,
  Submit,
} from '@radix-ui/react-form';
import { Slot } from '@radix-ui/react-slot';
import type { HTMLProps, ReactNode } from 'react';
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import type { BaseActorRef } from 'xstate';

import type { ClerkElementsError } from '../internals/errors/error';
import {
  fieldErrorsSelector,
  fieldHasValueSelector,
  globalErrorsSelector,
  useFormSelector,
  useFormStore,
} from '../internals/machines/form.context';
import type { FieldDetails } from '../internals/machines/form.types';

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

  return 'text' as const;
};

const useInput = ({ name: inputName, value: initialValue }: Partial<Pick<FieldDetails, 'name' | 'value'>>) => {
  // Inputs can be used outside of a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const name = inputName || fieldContext?.name;

  const ref = useFormStore();
  const hasValue = useFormSelector(fieldHasValueSelector(name));

  // Register the field in the machine context
  useEffect(() => {
    if (!name || ref.getSnapshot().context.fields.get(name)) return;

    ref.send({ type: 'FIELD.ADD', field: { name, value: initialValue } });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!name) return;
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value } });
    },
    [ref, name],
  );

  if (!name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;
  const type = determineInputTypeFromName(name);

  return {
    type,
    props: {
      onChange,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      tabIndex: shouldBeHidden ? -1 : 0,
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
function FieldState({ children }: { children: (state: { state: 'valid' | 'invalid' }) => ReactNode }) {
  const field = useFieldContext();
  const error = useFormSelector(fieldErrorsSelector(field?.name));
  const state = error ? ('invalid' as const) : ('valid' as const);

  const fieldState = { state };

  return children(fieldState);
}

function Input(props: FormControlProps) {
  const { name, value } = props;
  const field = useInput({ name, value });

  return (
    <RadixControl
      type={field.type}
      {...field.props}
      {...props}
    />
  );
}

function Label(props: FormLabelProps) {
  return <RadixLabel {...props} />;
}

// ================= ERRORS ================= //
type ClerkElementsErrorsRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
type ErrorsProps = {
  name?: string;
  render(error: ClerkElementsErrorsRenderProps): React.ReactNode;
} & HTMLProps<HTMLDivElement>;

/**
 * Component used to render:
 *  1. field-level errors when render within a <Field> or with a `name` prop
 *  2. global errors when rendered outside of a <Field> and without a `name` prop
 */
function Errors({ name, ...props }: ErrorsProps) {
  const fieldContext = useFieldContext();

  if (!fieldContext && !name) {
    return <GlobalErrors {...props} />;
  }

  return (
    <FieldErrors
      name={name}
      {...props}
    />
  );
}

function GlobalErrors({ render, ...rest }: Exclude<ErrorsProps, 'name'>) {
  const { errors } = useGlobalErrors();

  if (!errors) {
    return null;
  }

  return (
    <div
      role='alert'
      {...rest}
    >
      {errors.map(error => (
        <Slot key={`${error.name}-${error.code}`}>{render(error)}</Slot>
      ))}
    </div>
  );
}

function FieldErrors({ name, render }: ErrorsProps) {
  const fieldContext = useFieldContext();
  const fieldName = fieldContext?.name || name;
  const { errors } = useFieldErrors({ name: fieldName });

  if (!errors) {
    return null;
  }

  return (
    <>
      {errors.map(error => (
        <RadixMessage
          asChild
          match={error.matchFn}
          forceMatch={error.forceMatch}
          key={`${error.name}-${error.code}`}
        >
          {render(error)}
        </RadixMessage>
      ))}
    </>
  );
}

export { Field, FieldState, Form, Input, Errors, Label, Submit };
export type { FormControlProps, FormFieldProps, FormProps, ErrorsProps };
