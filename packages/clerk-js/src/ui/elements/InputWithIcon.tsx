import React from 'react';

import { Flex, Input } from '../customizables';
import type { PropsOfComponent, ThemableCssProp } from '../styledSystem';

type InputWithIcon = PropsOfComponent<typeof Input> & { leftIcon?: React.ReactElement } & {
  containerSx?: ThemableCssProp;
};

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIcon>((props, ref) => {
  const { leftIcon, sx, containerSx, ...rest } = props;
  return (
    <Flex
      center
      sx={theme => [
        {
          width: '100%',
          position: 'relative',
          '& .cl-internal-icon': {
            position: 'absolute',
            left: theme.space.$3x5,
            width: theme.sizes.$3x5,
            height: theme.sizes.$3x5,
            pointerEvents: 'none',
          },
        },
        containerSx,
      ]}
    >
      {leftIcon && React.cloneElement(leftIcon, { className: 'cl-internal-icon' })}
      <Input
        {...rest}
        sx={[
          theme => ({
            width: '100%',
            paddingLeft: theme.space.$10,
          }),
          sx,
        ]}
        ref={ref}
      />
    </Flex>
  );
});
