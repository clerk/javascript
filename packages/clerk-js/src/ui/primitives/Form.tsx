import React from 'react';

import { PrimitiveProps } from '../styledSystem';
import { Flex, FlexProps } from './Flex';

export type FormProps = PrimitiveProps<'form'> & Omit<FlexProps, 'onSubmit'>;

export const Form = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  return (
    <Flex
      direction='col'
      as='form'
      {...props}
      // @ts-ignore
      ref={ref}
    />
  );
});
