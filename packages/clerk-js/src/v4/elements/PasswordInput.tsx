import React from 'react';

import { Button, Col, descriptors, Flex, Icon, Input } from '../customizables';
import { EyeSlash } from '../icons';
import { PropsOfComponent } from '../styledSystem';
import { PasswordStrengthBar } from './PasswordStrengthBar';

type PasswordInputProps = PropsOfComponent<typeof Input> & {
  strengthMeter?: boolean;
};

export const PasswordInput = (props: PasswordInputProps) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, strengthMeter, ...rest } = props;

  const input = (
    <Flex
      direction='col'
      justify='center'
      sx={{ position: 'relative' }}
    >
      <Input
        {...rest}
        type={hidden ? 'password' : 'text'}
        sx={theme => ({ paddingRight: theme.space.$8 })}
      />
      <Button
        elementDescriptor={descriptors.formFieldInputShowPasswordButton}
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
      >
        <Icon
          elementDescriptor={descriptors.formFieldInputShowPasswordIcon}
          icon={EyeSlash}
        />
      </Button>
    </Flex>
  );

  if (strengthMeter) {
    return (
      <Col gap={2}>
        {input}
        <PasswordStrengthBar password={(props.value || '').toString()} />
      </Col>
    );
  }

  return input;
};
