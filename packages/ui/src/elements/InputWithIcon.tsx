import React from 'react';

import { Box, Flex, Input } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

type InputWithIcon = PropsOfComponent<typeof Input> & { leftIcon?: React.ReactElement };

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIcon>((props, ref) => {
  const { leftIcon, sx, ...rest } = props;
  return (
    <Flex
      center
      sx={{
        width: '100%',
        position: 'relative',
      }}
    >
      {leftIcon ? (
        <Box
          sx={theme => [
            {
              position: 'absolute',
              insetInlineStart: theme.space.$3x5,
              width: theme.sizes.$3x5,
              height: theme.sizes.$3x5,
              pointerEvents: 'none',
              display: 'grid',
              placeContent: 'center',
              '& svg': {
                position: 'absolute',
                width: '100%',
                height: '100%',
              },
            },
          ]}
        >
          {leftIcon}
        </Box>
      ) : null}
      <Input
        {...rest}
        sx={[
          theme => ({
            width: '100%',
            paddingInlineStart: theme.space.$10,
          }),
          sx,
        ]}
        ref={ref}
      />
    </Flex>
  );
});
