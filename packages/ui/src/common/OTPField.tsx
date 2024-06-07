import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function OTPField({
  label = 'One-time password',
  ...props
}: React.ComponentProps<typeof Common.Input> & {
  label?: React.ReactNode;
}) {
  return (
    <Common.Field
      asChild
      name='code'
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label visuallyHidden>{label}</Field.Label>
        </Common.Label>

        <Common.FieldState>
          {({ state }) => (
            <Common.Input
              type='otp'
              autoSubmit
              className='flex gap-2'
              render={({ value, status }) => (
                <Field.Input
                  type='otp'
                  data-status={status}
                  intent={state}
                  state={
                    (
                      {
                        cursor: 'focus-visible',
                        selected: 'focus-visible',
                        hovered: 'hover',
                        none: 'native',
                      } as const
                    )[status]
                  }
                  {...props}
                  asChild
                >
                  <span>{value}</span>
                </Field.Input>
              )}
            />
          )}
        </Common.FieldState>

        <Common.FieldError>
          {({ message }) => {
            return (
              <Field.Message
                justify='center'
                intent='error'
              >
                {message}
              </Field.Message>
            );
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
