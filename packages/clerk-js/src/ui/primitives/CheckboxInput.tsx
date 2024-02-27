import type { ComponentProps } from 'react';
import React from 'react';

import { Input } from './Input';

export type CheckboxInputProps = ComponentProps<typeof Input>;

export const CheckboxInput = React.forwardRef<HTMLInputElement, CheckboxInputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      {...props}
      type='checkbox'
    />
  );
});
