import { forwardRef } from 'react';

import { Box, Spinner } from '../customizables';

export const InfiniteListSpinner = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <Box
      ref={ref}
      sx={t => ({
        width: '100%',
        height: t.space.$12,
        position: 'relative',
      })}
    >
      <Box
        sx={{
          margin: 'auto',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateY(-50%) translateX(-50%)',
        }}
      >
        <Spinner
          size='md'
          colorScheme='primary'
        />
      </Box>
    </Box>
  );
});
