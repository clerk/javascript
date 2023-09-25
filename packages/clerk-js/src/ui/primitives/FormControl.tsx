import React from 'react';

import { Flex } from './Flex';
import type { FormControlProps } from './hooks';
import { FormControlContextProvider } from './hooks';

export const FormControl = (props: React.PropsWithChildren<FormControlProps>) => {
  const { hasError, id, isRequired, setError, setInfo, setSuccess, setWarning, setHasPassedComplexity, ...rest } =
    props;
  return (
    <Flex
      direction='col'
      {...rest}
      css={{ position: 'relative', flex: '1 1 auto' }}
    >
      <FormControlContextProvider
        {...{ hasError, id, isRequired, setError, setInfo, setSuccess, setWarning, setHasPassedComplexity }}
      >
        {props.children}
      </FormControlContextProvider>
    </Flex>
  );
};
