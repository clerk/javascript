'use client';

import { Field } from '@clerk/mosaic/components/field';
import { Input } from '@clerk/mosaic/components/input';
import { Radio } from '@clerk/mosaic/components/radio';

export default function FieldExample() {
  return (
    <>
      <Field.Root required>
        <Field.Label>Email address</Field.Label>
        <Input
          type='email'
          defaultValue='ada@example.com'
        />
        <Field.Description>We’ll send a verification code here.</Field.Description>
      </Field.Root>
      <Field.Root invalid>
        <Field.Label>Username</Field.Label>
        <Input defaultValue='ada' />
        <Field.Message>
          <Field.Error>That username is taken.</Field.Error>
        </Field.Message>
      </Field.Root>
      <Radio.Group defaultValue='all'>
        <Field.Root orientation='horizontal'>
          <Radio.Item value='all' />
          <Field.Content>
            <Field.Label>All members</Field.Label>
            <Field.Description>Everyone in the organization can see it.</Field.Description>
          </Field.Content>
        </Field.Root>
      </Radio.Group>
    </>
  );
}
