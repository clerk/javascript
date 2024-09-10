import * as Common from '@clerk/elements/common';
import React from 'react';

import { Animated } from '~/primitives/animated';
import * as Field from '~/primitives/field';

export function OTPField({
  label,
  resend,
  ...props
}: React.ComponentProps<typeof Common.Input> & {
  /**
   * **Note:** this prop is required as the `label` differs depending on the context (e.g. email code vs. link code)
   */
  label: React.ReactNode;
  resend?: React.ReactNode;
}) {
  return (
    <div className='flex flex-col justify-center gap-3'>
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
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className='flex justify-center gap-2'
                passwordManagerOffset={24}
                render={({ value, status }) => (
                  <Field.Input
                    variant='otp-digit'
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
                    <span>
                      {status === 'cursor' && (
                        <span
                          data-otp-field-cursor=''
                          // Note:
                          // Opportunity to extract lineHeight to theme
                          className='motion-safe:animate-blink h-[calc(theme(fontSize.base)*1.38462)] w-[2px] self-center rounded-full bg-current'
                        />
                      )}
                      {value}
                    </span>
                  </Field.Input>
                )}
              />
            )}
          </Common.FieldState>

          <Animated>
            <Common.FieldError asChild>
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
          </Animated>
        </Field.Root>
      </Common.Field>
      {resend && resend}
    </div>
  );
}
