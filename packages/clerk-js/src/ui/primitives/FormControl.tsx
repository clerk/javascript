import React from 'react';

import { Flex } from './Flex';
import type { FormControlProps } from './hooks';
import { FormControlContextProvider } from './hooks';

/**
 * @deprecated Use Field.Root
 * Each controlled field should have their own UI wrapper.
 * Field.Root is just a Provider
 */
export const FormControl = (props: React.PropsWithChildren<FormControlProps>) => {
  const { hasError, id, isRequired, setError, setSuccessful, setWarning, setHasPassedComplexity, ...rest } = props;
  return (
    <Flex
      direction='col'
      {...rest}
      css={{ position: 'relative', flex: '1 1 auto' }}
    >
      <FormControlContextProvider
        {...{ hasError, id, isRequired, setError, setSuccessful, setWarning, setHasPassedComplexity }}
      >
        {props.children}
      </FormControlContextProvider>
    </Flex>
  );
};
