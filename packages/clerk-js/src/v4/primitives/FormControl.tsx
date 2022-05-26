import React from 'react';

import { Flex } from './Flex';
import { FormControlContext, FormControlOptions, useFormControlProvider } from './hooks';

// TODO: Connect with CSS variables

type FormControlProps = {
  children: React.ReactNode;
} & FormControlOptions;

const FormControl = (props: FormControlProps) => {
  const ctx = useFormControlProvider(props);
  return (
    <FormControlContext.Provider value={ctx}>
      <Flex direction='col'>{props.children}</Flex>
    </FormControlContext.Provider>
  );
};

export { FormControl };
