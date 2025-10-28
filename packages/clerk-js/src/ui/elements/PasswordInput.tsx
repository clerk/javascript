import type { ClerkAPIError } from '@clerk/types';
import type { ChangeEvent } from 'react';
import React, { forwardRef, useRef, useState } from 'react';

import { DEBOUNCE_MS } from '../../core/constants';
import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input, localizationKeys, useLocalizations } from '../customizables';
import { usePassword } from '../hooks/usePassword';
import { Eye, EyeSlash } from '../icons';
import { common, type PropsOfComponent } from '../styledSystem';
import { mergeRefs } from '../utils/mergeRefs';
import { IconButton } from './IconButton';

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  validatePassword?: boolean;
  setError: (error: string | ClerkAPIError | undefined) => void;
  setWarning: (warning: string) => void;
  setSuccess: (message: string) => void;
  setInfo: (info: string) => void;
  setHasPassedComplexity: (b: boolean) => void;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const {
    id,
    onChange: onChangeProp,
    validatePassword: validatePasswordProp = false,
    setInfo,
    setSuccess,
    setWarning,
    setError,
    setHasPassedComplexity,
    ...rest
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [timeoutState, setTimeoutState] = useState<ReturnType<typeof setTimeout> | null>(null);

  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const { t } = useLocalizations();

  const { validatePassword } = usePassword(
    { ...passwordSettings, validatePassword: validatePasswordProp },
    {
      onValidationSuccess: () => setSuccess(t(localizationKeys('unstable__errors.zxcvbn.goodPassword'))),
      onValidationError: message => setError(message),
      onValidationWarning: message => setWarning(message),
      onValidationInfo: message => {
        // ref will be null when onFocus is triggered due to `autoFocus=true`
        if (!inputRef.current) {
          return;
        }
        const isElementFocused = inputRef.current === document.activeElement;
        if (isElementFocused) {
          setInfo(message);
        } else {
          // Turn the suggestion into an error if not focused.
          setError(message);
        }
      },
      onValidationComplexity: hasPassed => setHasPassedComplexity(hasPassed),
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
      sx={theme => ({
        position: 'relative',
        ...common.borderVariants(theme, { hasError: rest.hasError }).normal,
        '&:focus-within,&[data-focus-within="true"]': {
          ...common.borderVariants(theme, { hasError: rest.hasError }).normal['&:focus'],
        },
      })}
    >
      <Input
        {...rest}
        onChange={onChange}
        onBlur={e => {
          rest.onBlur?.(e);
          // Call validate password because to calculate the new feedbackType as the element is now blurred
          validatePassword(e.target.value);
        }}
        onFocus={e => {
          rest.onFocus?.(e);
          // Call validate password because to calculate the new feedbackType as the element is now focused
          validatePassword(e.target.value);
        }}
        //@ts-expect-error Type mismatch between ForwardRef and RefObject due to null
        ref={mergeRefs(ref, inputRef)}
        type={hidden ? 'password' : 'text'}
        variant='unstyled'
      />
      <IconButton
        elementDescriptor={descriptors.formFieldInputShowPasswordButton}
        iconElementDescriptor={descriptors.formFieldInputShowPasswordIcon}
        aria-label={`${hidden ? 'Show' : 'Hide'} password`}
        variant='ghost'
        size='xs'
        focusRing={false}
        hoverAsFocus
        onClick={() => setHidden(s => !s)}
        sx={theme => ({
          color: theme.colors.$neutralAlpha400,
          borderStartStartRadius: '0',
          borderEndStartRadius: '0',
          borderStartEndRadius: `calc(${theme.radii.$md} - ${theme.borderWidths.$normal})`,
          borderEndEndRadius: `calc(${theme.radii.$md} - ${theme.borderWidths.$normal})`,
        })}
        icon={hidden ? Eye : EyeSlash}
      />
    </Flex>
  );
});
