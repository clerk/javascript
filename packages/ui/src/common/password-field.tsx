import * as Common from '@clerk/elements/common';
import { cx } from 'cva';
import React from 'react';

import * as Field from '~/primitives/field';
import * as Icon from '~/primitives/icon';

export function PasswordField({
  alternativeFieldTrigger,
  className,
  label,
  name = 'password',
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  validatePassword?: boolean;
  name?: 'password' | 'confirmPassword';
  /**
   * **Note:** this prop is required as the `label` differs depending on the context (e.g. new password)
   */
  label: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'autoCapitalize' | 'autoComplete' | 'spellCheck' | 'type'>) {
  const [type, setType] = React.useState('password');
  const id = React.useId();

  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <Common.Label asChild>
          <Field.Label>
            {label}
            {alternativeFieldTrigger ? <Field.LabelEnd>{alternativeFieldTrigger}</Field.LabelEnd> : null}
          </Field.Label>
        </Common.Label>
        <Common.FieldState>
          {({ state }) => {
            return (
              <Field.InputGroup>
                <Common.Input
                  type={type}
                  className={cx('pe-7', className)}
                  {...props}
                  aria-describedby={props.validatePassword && state !== 'idle' ? id : undefined}
                  asChild
                >
                  <Field.Input intent={state} />
                </Common.Input>
                <Field.InputEnd>
                  <button
                    type='button'
                    className={cx(
                      'text-icon-sm text-gray-11 start-auto m-[0.1875rem] inline-flex aspect-square h-6 items-center justify-center rounded-sm p-0 outline-none disabled:cursor-not-allowed disabled:opacity-50',
                      'hover:enabled:text-gray-12 hover:enabled:bg-gray-3',
                      'focus-visible:rounded-[calc(var(--cl-radius)*0.5)] focus-visible:ring',
                    )}
                    onClick={() => setType(prev => (prev === 'password' ? 'text' : 'password'))}
                    title={[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}
                    disabled={props.disabled}
                  >
                    <span className='sr-only'>{[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}</span>
                    {type === 'password' ? <Icon.EyeSlashSm /> : <Icon.EyeSm />}
                  </button>
                </Field.InputEnd>
              </Field.InputGroup>
            );
          }}
        </Common.FieldState>
        {props.validatePassword ? (
          <Common.FieldState>
            {({ state, message }) => {
              if (state === 'idle') {
                return;
              }
              return (
                <Field.Message
                  id={id}
                  intent={state}
                >
                  {message}
                </Field.Message>
              );
            }}
          </Common.FieldState>
        ) : (
          <Common.FieldError asChild>
            {({ message }) => {
              return <Field.Message intent='error'>{message}</Field.Message>;
            }}
          </Common.FieldError>
        )}
      </Field.Root>
    </Common.Field>
  );
}
