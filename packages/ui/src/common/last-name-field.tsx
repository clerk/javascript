import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function LastNameField({
  label = 'Last name',
  hintText = 'Optional',
  ...props
}: { label?: React.ReactNode; hintText?: string } & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  return (
    <Common.Field
      name='lastName'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label} {!props?.required ? <Field.Hint>{hintText}</Field.Hint> : null}
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
