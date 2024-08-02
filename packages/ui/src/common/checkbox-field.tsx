import * as Common from '@clerk/elements/common';
import React from 'react';

import * as Field from '~/primitives/field';

export function CheckboxField({
  label,
  name,
  ...props
}: { name: React.ComponentProps<typeof Common.Field>['name']; label: React.ReactNode } & Omit<
  React.ComponentProps<typeof Common.Input>,
  'className' | 'type'
>) {
  return (
    <Common.Field
      name={name}
      asChild
    >
      <Field.Root>
        <div className='flex gap-2'>
          <Common.Input
            type='checkbox'
            asChild
            {...props}
          >
            <Field.Checkbox />
          </Common.Input>

          <Common.Label asChild>
            <Field.Label>{label}</Field.Label>
          </Common.Label>
        </div>

        <Common.FieldError asChild>
          {({ message }) => {
            return <Field.Message intent='error'>{message}</Field.Message>;
          }}
        </Common.FieldError>
      </Field.Root>
    </Common.Field>
  );
}
