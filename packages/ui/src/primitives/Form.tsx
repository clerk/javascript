import React from 'react';

import type { PrimitiveProps } from '../styledSystem';
import type { FlexProps } from './Flex';
import { Flex } from './Flex';

export type FormProps = PrimitiveProps<'form'> & Omit<FlexProps, 'onSubmit'>;

export const Form = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => {
  return (
    <Flex
      direction='col'
      as='form'
      {...props}
      // @ts-expect-error
      ref={ref}
    />
  );
});
