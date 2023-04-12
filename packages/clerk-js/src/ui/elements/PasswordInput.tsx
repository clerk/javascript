import type { ChangeEvent } from 'react';
import React, { forwardRef } from 'react';

import { useEnvironment } from '../contexts';
import { descriptors, Flex, Input } from '../customizables';
import { usePassword } from '../hooks/usePassword';
import { EyeSlash } from '../icons';
import { useFormControl } from '../primitives/hooks';
import type { PropsOfComponent } from '../styledSystem';
import { IconButton } from './IconButton';

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  strengthMeter?: boolean;
  complexity?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, onChange: onChangeProp, strengthMeter = false, complexity = false, ...rest } = props;
  const {
    userSettings: { passwordSettings },
  } = useEnvironment();

  const formControlProps = useFormControl();

  const { setPassword } = usePassword(
    { ...passwordSettings, complexity, strengthMeter },
    {
      onValidationSuccess: () => formControlProps?.setSuccessful?.(true),
      onValidationFailed: errorMessage => formControlProps?.setError?.(errorMessage),
    },
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
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
