import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function OTPField({
  label = 'One-time password',
  resend,
  ...props
}: React.ComponentProps<typeof Common.Input> & {
  label?: React.ReactNode;
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
      {resend && <p className='text-gray-10 text-center text-base font-normal'>{resend}</p>}
    </div>
  );
}
