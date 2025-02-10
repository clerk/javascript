import * as Common from '@clerk/elements/common';
import React from 'react';

import { Animated } from '~/primitives/animated';
import * as Field from '~/primitives/field';
import { cx } from '~/utils/dva';

export function OTPField({
  label,
  resend,
  ...props
}: React.ComponentProps<'span'> & {
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
                  <span
                    className={cx(
                      'py-[--field-input-py]',
                      'ps-[--field-input-px]',
                      // If an `InputGroup` exists, use the `pe` value, or fallback to the
                      // standard input `px` value
                      'pe-[var(--field-input-group-pe,var(--field-input-px))]',
                      'text-gray-12 relative flex min-w-0 items-center rounded-md bg-white text-base outline-none ring ring-offset-1',
                      'shadow-[0px_1px_1px_0px_theme(colors.gray.a3)]',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'supports-ios:text-[length:1rem] supports-ios:min-h-[1.875rem]',
                      'aspect-square size-10 justify-center text-[calc(var(--cl-font-size)*1.4)] font-semibold',
                      {
                        none: 'ring-offset-[--cl-field-input-border] focus-visible:ring focus-visible:ring-[--cl-field-input-ring,theme(ringColor.light)] focus-visible:ring-offset-[--cl-field-input-border-active] hover:enabled:ring-offset-[--cl-field-input-border-active] [&:not(:focus-visible)]:ring-transparent',
                        hovered: 'ring-transparent ring-offset-[--cl-field-input-border-active]',
                        cursor:
                          'ring-[--cl-field-input-ring,theme(ringColor.light)] ring-offset-[--cl-field-input-border-active]',
                        selected:
                          'ring-[--cl-field-input-ring,theme(ringColor.light)] ring-offset-[--cl-field-input-border-active]',
                      }[status],
                      {
                        idle: [
                          '[--cl-field-input-border:theme(colors.gray.a4)]',
                          '[--cl-field-input-border-active:theme(colors.gray.a7)]',
                        ],
                        info: [
                          '[--cl-field-input-border:theme(colors.gray.a7)]',
                          '[--cl-field-input-border-active:theme(colors.gray.a7)]',
                        ],
                        error: [
                          '[--cl-field-input-border:theme(colors.danger.DEFAULT)]',
                          '[--cl-field-input-border-active:theme(colors.danger.DEFAULT)]',
                          '[--cl-field-input-ring:theme(colors.danger.DEFAULT/0.2)]',
                        ],
                        success: [
                          '[--cl-field-input-border:theme(colors.success.DEFAULT)]',
                          '[--cl-field-input-border-active:theme(colors.success.DEFAULT)]',
                          '[--cl-field-input-ring:theme(colors.success.DEFAULT/0.25)]', // (optically adjusted ring to 25 opacity)
                        ],
                        warning: [
                          '[--cl-field-input-border:theme(colors.warning.DEFAULT)]',
                          '[--cl-field-input-border-active:theme(colors.warning.DEFAULT)]',
                          '[--cl-field-input-ring:theme(colors.warning.DEFAULT/0.2)]',
                        ],
                      }[state],
                    )}
                    {...props}
                  >
                    {status === 'cursor' && (
                      <span className='motion-safe:animate-blink h-[calc(theme(fontSize.base)*1.38462)] w-[2px] self-center rounded-full bg-current' />
                    )}
                    {value}
                  </span>
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
