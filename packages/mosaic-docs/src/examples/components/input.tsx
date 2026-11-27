'use client';

import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';

export default function InputExample() {
  return (
    <>
      <Field.Root>
        <Field.Label>Small</Field.Label>
        <Input
          size='sm'
          placeholder='ada@example.com'
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Medium</Field.Label>
        <Input
          type='email'
          autoComplete='email'
          placeholder='ada@example.com'
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Large</Field.Label>
        <Input
          size='lg'
          placeholder='ada@example.com'
        />
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>Disabled</Field.Label>
        <Input defaultValue='ada@example.com' />
      </Field.Root>
    </>
  );
}
