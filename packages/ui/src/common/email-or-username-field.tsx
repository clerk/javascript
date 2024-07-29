import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function EmailOrUsernameField({
  alternativeFieldTrigger,
  label,
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  label: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  return (
    <Common.Field
      name='identifier'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label}{' '}
            {alternativeFieldTrigger && <span className='flex-grow self-end text-end'>{alternativeFieldTrigger}</span>}
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
