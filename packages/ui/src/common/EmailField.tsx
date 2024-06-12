import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function EmailField({
  className,
  label = 'Email address',
  alternativeFieldTrigger,
  ...props
}: { label?: React.ReactNode; alternativeFieldTrigger?: React.ReactNode } & Omit<
  React.ComponentProps<typeof Common.Input>,
  'type'
>) {
  return (
    <Common.Field
      name='emailAddress'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label} {alternativeFieldTrigger && <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd>}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Common.Input
                type='email'
                className={className}
                {...props}
                asChild
              >
                <Field.Input intent={state} />
              </Common.Input>
            );
          }}
        </Common.FieldState>
        <Common.FieldError>
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
