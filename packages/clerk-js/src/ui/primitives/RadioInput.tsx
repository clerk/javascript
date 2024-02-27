import type { ComponentProps } from 'react';
import React from 'react';

import { Input } from './Input';

export type RadioInputProps = ComponentProps<typeof Input>;

export const RadioInput = React.forwardRef<HTMLInputElement, RadioInputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      type='radio'
    />
  );
});
