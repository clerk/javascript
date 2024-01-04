import type { FormControlProps, FormFieldProps, FormLabelProps, FormProps } from '@radix-ui/react-form';
import {
  Control as RadixControl,
  Field as RadixField,
  Form as RadixForm,
  Label as RadixLabel,
  Message as RadixMessage,
  Submit,
} from '@radix-ui/react-form';
import type { SlotProps } from '@radix-ui/react-slot';
import { Slot } from '@radix-ui/react-slot';
import React from 'react';

import type { ClerkElementsError } from '../internals/errors/error';
import {
  FieldContext,
  useField,
  useFieldDetails,
  useFieldErrors,
  useForm,
  useInput,
} from '../internals/machines/sign-in.context';

// ================= FORM ================= //

function Form({ asChild, ...rest }: FormProps) {
  const form = useForm();

  return (
    <RadixForm
      {...form.props}
      {...rest}
    />
  );
}

// ================= FIELD ================= //

function Field(props: FormFieldProps) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <InnerField {...props} />
    </FieldContext.Provider>
  );
}

function InnerField(props: FormFieldProps) {
  const field = useField({ type: props.name });

  return (
    <RadixField
      {...field.props}
      {...props}
    />
  );
}

// ================= LABEL ================= //

function Label(props: FormLabelProps) {
  const { name } = useFieldDetails();

  return (
    <RadixLabel
      htmlFor={name}
      {...props}
    />
  );
}

// ================= INPUT ================= //

function Input(props: FormControlProps) {
  const { type, value } = props;
  const field = useInput({ type, value });

  return (
    <RadixControl
      {...field.props}
      {...props}
    />
  );
}

// ================= ERRORS ================= //

type ClerkElementsErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
interface ErrorsProps extends SlotProps {
  render(error: ClerkElementsErrorRenderProps): React.ReactNode;
}

function Errors({ render }: ErrorsProps) {
  const errors = [] as ClerkElementsError[];

  return errors.map(error => <Slot key={`${error.name}-global-${error.code}`}>{render(error)}</Slot>);
}

type ClerkElementsFieldErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;
interface FieldErrorsProps {
  render(error: ClerkElementsFieldErrorRenderProps): React.ReactNode;
}

function FieldErrors({ render }: FieldErrorsProps) {
  const { name } = useFieldDetails();
  const { errors } = useFieldErrors({ type: name });

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
          key={`${error.name}-${name}-${error.code}`}
        >
          {render(error)}
        </RadixMessage>
      ))}
    </>
  );
}

export { Errors, Field, Form, Input, FieldErrors, Label, Submit };
export type { FormControlProps, FormFieldProps, FormProps, FieldErrorsProps, ErrorsProps };
