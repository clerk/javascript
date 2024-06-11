import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function UsernameField({
  label = 'Username',
  ...props
}: { label?: React.ReactNode } & Omit<React.ComponentProps<typeof Common.Input>, 'type'>) {
  return (
    <Common.Field
      name='lastName'
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {' '}
            <span className='flex w-full items-baseline justify-between'>
              <span>{label}</span>
              {!props?.required && <span className='font-medium text-sm text-gray-10'>Optional</span>}
            </span>
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
