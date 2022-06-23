import React from 'react';

import { Flex } from './Flex';
import { FormControlContextProvider, FormControlProps } from './hooks';

export const FormControl = (props: React.PropsWithChildren<FormControlProps>) => {
  const { hasError, id, isRequired, ...rest } = props;
  return (
    <Flex
      direction='col'
      {...rest}
      css={{ position: 'relative', flex: '1 1 auto' }}
    >
      <FormControlContextProvider {...{ hasError, id, isRequired }}>{props.children}</FormControlContextProvider>
    </Flex>
  );
};
