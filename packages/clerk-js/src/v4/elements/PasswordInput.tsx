import React from 'react';

import { Button, descriptors, Flex, Icon, Input } from '../customizables';
import { EyeSlash } from '../icons';
import { PropsOfComponent } from '../styledSystem';

export const PasswordInput = (props: PropsOfComponent<typeof Input>) => {
  const [hidden, setHidden] = React.useState(true);
  const { id, ...rest } = props;
  return (
    <Flex
      elementDescriptor={descriptors.formFieldInputGroup}
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
};
