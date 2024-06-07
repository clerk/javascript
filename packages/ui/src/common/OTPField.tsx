import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '../primitives/field';

export function OTPField({
  label = 'One-time password',
}: {
  disabled?: boolean;
  className?: string;
  label?: React.ReactNode;
}) {
  return (
    <Common.Field name='code'>
      <Common.Label className='sr-only'>{label}</Common.Label>

      <Common.Input
        type='otp'
        className='flex gap-2'
        passwordManagerOffset={40}
        render={({ value, status }) => (
          <Field.Input
            className='border'
            data-status={status}
            asChild
          >
            <span>{value}</span>
          </Field.Input>
        )}
      />
    </Common.Field>
  );
}
