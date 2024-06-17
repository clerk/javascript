import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function UsernameField({
  alternativeFieldTrigger,
  label = 'Username',
  ...props
}: { alternativeFieldTrigger?: React.ReactNode; label?: React.ReactNode } & Omit<
  React.ComponentProps<typeof Common.Input>,
  'type'
>) {
  return (
    <Common.Field
      name='username'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
<<<<<<< HEAD
            {label}{' '}
            {alternativeFieldTrigger ? (
              <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>
            ) : !props?.required ? (
              <Field.Optional>Optional</Field.Optional>
            ) : null}
=======
            {label} {alternativeFieldTrigger && <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>}
>>>>>>> 5489624ab (implement dynamic fields)
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                type='text'
                {...props}
                asChild
              >
                <Field.Input intent={state} />
              </Common.Input>
            );
          }}
        </Common.FieldState>
        <Common.FieldError asChild>
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
