import { Control as RadixControl, type FormControlProps } from '@radix-ui/react-form';
import * as React from 'react';

import { ClerkElementsFieldError } from '~/internals/errors';
import { fieldValueSelector, useFormSelector, useFormStore } from '~/internals/machines/form';
import { usePassword } from '~/react/hooks/use-password.hook';

import type { FormInputProps } from '../index';
import { OTP_LENGTH_DEFAULT, OTPInput, type OTPInputProps } from '../otp';
import { determineInputTypeFromName, enrichFieldState } from '../utils';
import { useFieldContext } from './use-field-context';
import { useFieldState } from './use-field-state';
import { usePrevious } from './use-previous';
import { useValidityStateContext } from './use-validity-state-context';

// TODO: DRY
type PasswordInputProps = Exclude<FormControlProps, 'type'> & {
  validatePassword?: boolean;
};

export function useInput({
  name: inputName,
  value: providedValue,
  checked: providedChecked,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  onFocus: onFocusProp,
  type: inputType,
  ...passthroughProps
}: FormInputProps) {
  // Inputs can be used outside a <Field> wrapper if desired, so safely destructure here
  const fieldContext = useFieldContext();
  const rawName = inputName || fieldContext?.name;
  const name = rawName === 'backup_code' ? 'code' : rawName; // `backup_code` is a special case of `code`
  const { state: fieldState } = useFieldState({ name });
  const validity = useValidityStateContext();

  if (!rawName || !name) {
    throw new Error('Clerk: <Input /> must be wrapped in a <Field> component or have a name prop.');
  }

  const ref = useFormStore();
  const [hasPassedValiation, setHasPassedValidation] = React.useState(false);

  const { validatePassword } = usePassword({
    onValidationComplexity: hasPassed => setHasPassedValidation(hasPassed),
    onValidationSuccess: () => {
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: { name, feedback: { type: 'success', message: 'Your password meets all the necessary requirements.' } },
      });
    },
    onValidationError: (error, codes) => {
      if (error) {
        ref.send({
          type: 'FIELD.FEEDBACK.SET',
          field: {
            name,
            feedback: {
              type: 'error',
              message: new ClerkElementsFieldError('password-validation-error', error),
              codes,
            },
          },
        });
      }
    },
    onValidationWarning: (warning, codes) =>
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: { name, feedback: { type: 'warning', message: warning, codes } },
      }),
    onValidationInfo: (info, codes) => {
      // TODO: If input is not focused, make this info an error
      ref.send({
        type: 'FIELD.FEEDBACK.SET',
        field: {
          name,
          feedback: {
            type: 'info',
            message: info,
            codes,
          },
        },
      });
    },
  });

  const value = useFormSelector(fieldValueSelector(name));
  const prevValue = usePrevious(value);
  const hasValue = Boolean(value);
  const type = inputType ?? determineInputTypeFromName(rawName);
  let nativeFieldType = type;
  let shouldValidatePassword = false;

  if (type === 'password' || type === 'text') {
    shouldValidatePassword = Boolean((passthroughProps as PasswordInputProps).validatePassword);
  }

  if (nativeFieldType === 'otp' || nativeFieldType === 'backup_code') {
    nativeFieldType = 'text';
  }

  // Register the field in the machine context
  React.useEffect(() => {
    if (!name) {
      return;
    }

    ref.send({
      type: 'FIELD.ADD',
      field: { name, type: nativeFieldType, value: providedValue, checked: providedChecked },
    });

    return () => ref.send({ type: 'FIELD.REMOVE', field: { name } });
  }, [ref]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!name) {
      return;
    }

    if (
      (type === 'checkbox' && providedChecked !== undefined) ||
      (type !== 'checkbox' && providedValue !== undefined)
    ) {
      ref.send({
        type: 'FIELD.UPDATE',
        field: { name, value: providedValue, checked: providedChecked },
      });
    }
  }, [name, type, ref, providedValue, providedChecked]);

  // Register the onChange handler for field updates to persist to the machine context
  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeProp?.(event);
      if (!name) {
        return;
      }
      ref.send({ type: 'FIELD.UPDATE', field: { name, value: event.target.value, checked: event.target.checked } });
      if (shouldValidatePassword) {
        validatePassword(event.target.value);
      }
    },
    [ref, name, onChangeProp, shouldValidatePassword, validatePassword],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onBlurProp?.(event);
      if (shouldValidatePassword && event.target.value !== prevValue) {
        validatePassword(event.target.value);
      }
    },
    [onBlurProp, shouldValidatePassword, validatePassword, prevValue],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      onFocusProp?.(event);
      if (shouldValidatePassword && event.target.value !== prevValue) {
        validatePassword(event.target.value);
      }
    },
    [onFocusProp, shouldValidatePassword, validatePassword, prevValue],
  );

  // TODO: Implement clerk-js utils
  const shouldBeHidden = false;

  const Element = type === 'otp' ? OTPInput : RadixControl;

  let props = {};
  if (type === 'otp') {
    const p = passthroughProps as Omit<OTPInputProps, 'name' | 'value' | 'type'>;
    const length = p.length || OTP_LENGTH_DEFAULT;

    props = {
      'data-otp-input': true,
      autoComplete: 'one-time-code',
      inputMode: 'numeric',
      pattern: `[0-9]{${length}}`,
      minLength: length,
      maxLength: length,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        // Only accept numbers
        event.currentTarget.value = event.currentTarget.value.replace(/\D+/g, '');
        onChange(event);
      },
      type: 'text',
      spellCheck: false,
    };
  } else if (type === 'backup_code') {
    props = {
      autoComplete: 'off',
      type: 'text',
      spellCheck: false,
    };
  } else if (type === 'password' && shouldValidatePassword) {
    props = {
      'data-has-passed-validation': hasPassedValiation ? true : undefined,
    };
  }

  // Filter out invalid props that should not be passed through
  // @ts-expect-error - Doesn't know about type narrowing by type here
  const { validatePassword: _1, ...rest } = passthroughProps;

  return {
    Element,
    props: {
      type,
      value: value ?? '',
      onChange,
      onBlur,
      onFocus,
      'data-hidden': shouldBeHidden ? true : undefined,
      'data-has-value': hasValue ? true : undefined,
      'data-state': enrichFieldState(validity, fieldState),
      ...props,
      ...rest,
    },
  };
}
