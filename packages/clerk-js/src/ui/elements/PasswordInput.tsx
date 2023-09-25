import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
import React, { forwardRef } from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input, localizationKeys, useLocalizations } from '../customizables';
import { usePassword } from '../hooks/usePassword';
import { Eye, EyeSlash } from '../icons';
import { useFormControl } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { mergeRefs } from '../utils';
import { IconButton } from './IconButton';

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  validatePassword?: boolean;
};

const DEBOUNCE_MS = 350;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, onChange: onChangeProp, validatePassword: validatePasswordProp = false, ...rest } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeoutState, setTimeoutState] = useState<NodeJS.Timeout | null>(null);

  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const formControlProps = useFormControl();
  const { t } = useLocalizations();

  const { validatePassword } = usePassword(
    { ...passwordSettings, validatePassword: validatePasswordProp },
    {
      onValidationSuccess: () =>
        formControlProps?.setSuccess?.(t(localizationKeys('unstable__errors.zxcvbn.goodPassword'))),
      onValidationError: message => formControlProps?.setError?.(message),
      onValidationWarning: message => formControlProps?.setWarning?.(message),
      onValidationInfo: message => {
        if (inputRef.current === document.activeElement) {
          formControlProps?.setInfo?.(message);
        } else {
          formControlProps?.setError?.(message);
        }
      },
      onValidationComplexity: hasPassed => formControlProps?.setHasPassedComplexity?.(hasPassed),
    },
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (timeoutState) {
      clearTimeout(timeoutState);
    }
    setTimeoutState(
      setTimeout(() => {
        validatePassword(e.target.value);
      }, DEBOUNCE_MS),
    );
    return onChangeProp?.(e);
  };

  return (
    <Flex
      elementDescriptor={descriptors.formFieldInputGroup}
      direction='col'
      justify='center'
      sx={{ position: 'relative' }}
    >
      <Input
        {...rest}
        onChange={onChange}
        onBlur={e => {
          rest.onBlur?.(e);
          onChange(e);
        }}
        onFocus={e => {
          rest.onFocus?.(e);
          onChange(e);
        }}
        //@ts-expect-error
        ref={mergeRefs(ref, inputRef)}
        type={hidden ? 'password' : 'text'}
        sx={theme => ({ paddingRight: theme.space.$10 })}
      />
      <IconButton
        elementDescriptor={descriptors.formFieldInputShowPasswordButton}
        iconElementDescriptor={descriptors.formFieldInputShowPasswordIcon}
        aria-label={`${hidden ? 'Show' : 'Hide'} password`}
        variant='ghostIcon'
        tabIndex={-1}
        colorScheme={'neutral'}
        onClick={() => setHidden(s => !s)}
        sx={theme => ({
          position: 'absolute',
          right: 0,
          marginRight: theme.space.$3,
          color: theme.colors.$blackAlpha400,
        })}
        icon={hidden ? Eye : EyeSlash}
      />
    </Flex>
  );
});
