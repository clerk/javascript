import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

const FIELD_NAME = 'emailAddress';
const ERROR_NAME = 'email_address';

export function EmailField({
  alternativeFieldTrigger,
  label = 'Email address',
  name = FIELD_NAME,
  hintText = 'Optional',
  error,
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  label?: React.ReactNode;
  hintText?: string;
  error?: (message: string, code: string, name: string) => string;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label}{' '}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !props?.required ? (
              <Field.Hint>{hintText}</Field.Hint>
            ) : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                type='email'
                {...props}
                asChild
              >
                <Field.Input intent={state} />
              </Common.Input>
            );
          }}
        </Common.FieldState>
        <Common.FieldError asChild>
          {({ message, code }) => {
            return <Field.Message intent='error'>{error ? error(message, code, ERROR_NAME) : message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
