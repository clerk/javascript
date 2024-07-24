import * as Common from '@clerk/elements/common';
import { cx } from 'cva';
import React from 'react';

import { useLocalizations } from '~/hooks/use-localizations';
import { translatePasswordError } from '~/utils/makeLocalizable';

import * as Field from '../primitives/field';
import * as Icon from '../primitives/icon';

export function PasswordField({
  alternativeFieldTrigger,
  className,
  label = 'Password',
  name = 'password',
  ...props
}: {
  alternativeFieldTrigger?: React.ReactNode;
  validatePassword?: boolean;
  name?: 'password' | 'confirmPassword';
  label?: React.ReactNode;
} & Omit<React.ComponentProps<typeof Common.Input>, 'autoCapitalize' | 'autoComplete' | 'spellCheck' | 'type'>) {
  const [type, setType] = React.useState('password');
  const id = React.useId();
  const { t, locale } = useLocalizations();

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
              <div className='relative'>
                <Common.Input
                  type={type}
                  className={cx('pe-7', className)}
                  {...props}
                  aria-describedby={props.validatePassword && state !== 'idle' ? id : undefined}
                  asChild
                >
                  <Field.Input intent={state} />
                </Common.Input>
                <button
                  type='button'
                  className={cx(
                    'text-icon-sm text-gray-11 absolute end-1 top-1 aspect-square rounded-sm p-1 outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    'hover:enabled:text-gray-12 hover:enabled:bg-gray-3',
                    'focus-visible:rounded-[calc(var(--cl-radius)*0.4)] focus-visible:ring',
                  )}
                  onClick={() => setType(prev => (prev === 'password' ? 'text' : 'password'))}
                  title={[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}
                  disabled={props.disabled}
                >
                  <span className='sr-only'>{[type === 'password' ? 'Show' : 'Hide', 'password'].join(' ')}</span>
                  {type === 'password' ? <Icon.EyeSlashSm /> : <Icon.EyeSm />}
                </button>
              </div>
            );
          }}
        </Common.FieldState>
        {props.validatePassword ? (
          <Common.FieldState>
            {({ state, message, codes, config }) => {
              if (state === 'idle') {
                return;
              }
              console.log(codes);
              if (state === 'success') {
                return (
                  <Field.Message
                    id={id}
                    intent='success'
                  >
                    {t('unstable__errors.zxcvbn.goodPassword')}
                  </Field.Message>
                );
              }
              return (
                <Field.Message
                  id={id}
                  intent={state}
                >
                  {translatePasswordError({ config, failedValidations: codes, locale, t })}
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
