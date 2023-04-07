import type { ChangeEvent } from 'react';
import React, { forwardRef } from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input } from '../customizables';
import { usePasswordComplexity } from '../hooks';
import { EyeSlash } from '../icons';
import { useFormControl } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { IconButton } from './IconButton';

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  complexity?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, onChange, complexity = false, ...rest } = props;
  const formControlProps = useFormControl();
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const { setPassword } = usePasswordComplexity(
    //TODO: Remove this once default values are populated in DB
    { ...passwordSettings, max_length: passwordSettings.max_length === 0 ? 999 : 0 },
    {
      onValidationFailed: (_, errorMessage) => {
        formControlProps.setError?.(errorMessage);
      },
      onValidationSuccess: () => formControlProps.setSuccessful?.(true),
    },
  );

  const __internalOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (complexity) {
      /**
       * Avoid introducing internal state, treat complexity calculation within callback.
       * This removes the overhead of keeping state of whether the component has been touched or not.
       */
      setPassword(e.target.value);
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
