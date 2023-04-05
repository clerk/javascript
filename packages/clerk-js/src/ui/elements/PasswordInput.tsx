import type { ChangeEvent } from 'react';
import React, { forwardRef, useCallback, useMemo } from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input, localizationKeys, useLocalizations } from '../customizables';
import { EyeSlash } from '../icons';
import { useFormControl } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { IconButton } from './IconButton';

const testComplexityCases = (password: string) => {
  return {
    min_length: password.length >= 8,
    require_numbers: /\d/.test(password),
    require_lowercase: /[a-z]/.test(password),
    require_uppercase: /[A-Z]/.test(password),
    require_special_char: /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(password),
  };
};

const usePasswordComplexity = () => {
  const {
    userSettings: {
      passwordSettings: { min_length, require_lowercase, require_numbers, require_uppercase, require_special_char },
    },
  } = useEnvironment();
  const formControlProps = useFormControl();
  const { t } = useLocalizations();

  const errors = useMemo(
    () => ({
      // Your password must contain
      min_length: t(localizationKeys('passwordComplexity.minimumLength', { length: min_length })),
      require_numbers: t(localizationKeys('passwordComplexity.requireNumbers')),
      require_lowercase: t(localizationKeys('passwordComplexity.requireLowercase')),
      require_uppercase: t(localizationKeys('passwordComplexity.requireUppercase')),
      require_special_char: t(localizationKeys('passwordComplexity.requireSpecialCharacter')),
    }),
    [min_length],
  );

  const handleComplexity = useCallback(
    (password: string) => {
      const testCases = testComplexityCases(password);

      const keys = { min_length, require_special_char, require_lowercase, require_numbers, require_uppercase };

      // TODO: rewrite this ugly thing
      const error = Object.entries(keys)
        .filter(([_, v]) => v)
        .map(([k, _]) => {
          const key = k as keyof typeof keys;
          return testCases[key] ? '' : errors[key];
        })
        .filter(a => a)
        .join(', ');

      if (error) {
        formControlProps.setError?.(`${t(localizationKeys('passwordComplexity.sentencePrefix'))} ${error}`);
      } else {
        formControlProps.setSuccessful?.(true);
      }
    },
    [formControlProps.setError],
  );

  return {
    errors,
    handleComplexity,
  };
};

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  complexity?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, onChange, complexity = false, ...rest } = props;
  const { handleComplexity } = usePasswordComplexity();

  const __internalOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (complexity) {
      /**
       * Avoid introducing internal state, treat complexity calculation within callback.
       * This removes the overhead of keeping state of whether the component has been touched or not.
       */
      handleComplexity(e.target.value);
    }
    return onChange?.(e);
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
        onChange={__internalOnChange}
        ref={ref}
        type={hidden ? 'password' : 'text'}
        sx={theme => ({ paddingRight: theme.space.$10 })}
      />

      <IconButton
        elementDescriptor={descriptors.formFieldInputShowPasswordButton}
        iconElementDescriptor={descriptors.formFieldInputShowPasswordIcon}
        aria-label={`${hidden ? 'Show' : 'Hide'} password`}
        variant='ghostIcon'
        tabIndex={-1}
        colorScheme={hidden ? 'neutral' : 'primary'}
        onClick={() => setHidden(s => !s)}
        sx={theme => ({
          position: 'absolute',
          right: 0,
          marginRight: theme.space.$3,
          ...(hidden && { color: theme.colors.$blackAlpha400 }),
        })}
        icon={EyeSlash}
      />
    </Flex>
  );
});
