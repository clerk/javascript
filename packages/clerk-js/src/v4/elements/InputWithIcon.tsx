import React from 'react';

import { Flex, Input } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

type InputWithIcon = PropsOfComponent<typeof Input> & { leftIcon?: React.ReactElement };

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIcon>((props, ref) => {
  const { leftIcon, ...rest } = props;
  return (
    <Flex
      center
      sx={theme => ({
        width: '100%',
        position: 'relative',
        '& .cl-internal-icon': {
          position: 'absolute',
          left: theme.space.$4,
          width: theme.sizes.$3x5,
          height: theme.sizes.$3x5,
        },
      })}
    >
      {leftIcon && React.cloneElement(leftIcon, { className: 'cl-internal-icon' })}
      <Input
        {...rest}
        sx={[
          theme => ({
            width: '100%',
            paddingLeft: theme.space.$10,
          }),
          rest.sx,
        ]}
        ref={ref}
      />
    </Flex>
  );
});
