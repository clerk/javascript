'use client';

import { Field } from '@clerk/mosaic/components/field';
import { Radio } from '@clerk/mosaic/components/radio';

export default function RadioExample() {
  return (
    <>
      <Radio.Group
        name='visibility'
        defaultValue='members'
        aria-label='Visibility'
      >
        <Field.Root orientation='horizontal'>
          <Radio.Item value='members' />
          <Field.Content>
            <Field.Label>Members</Field.Label>
          </Field.Content>
        </Field.Root>
        <Field.Root orientation='horizontal'>
          <Radio.Item value='admins' />
          <Field.Content>
            <Field.Label>Admins only</Field.Label>
          </Field.Content>
        </Field.Root>
      </Radio.Group>
      <Radio.Group
        name='provider'
        defaultValue='okta'
        aria-label='Identity provider'
      >
        <Radio.Card value='okta'>
          <Radio.Content>
            <Radio.Label>Okta Workforce</Radio.Label>
            <Radio.Description>SAML with SCIM provisioning</Radio.Description>
          </Radio.Content>
        </Radio.Card>
        <Radio.Card value='entra'>
          <Radio.Content>
            <Radio.Label>Microsoft Entra ID</Radio.Label>
            <Radio.Description>SAML single sign-on</Radio.Description>
          </Radio.Content>
        </Radio.Card>
        <Radio.Card
          value='custom'
          disabled
        >
          <Radio.Content>
            <Radio.Label>Custom SAML</Radio.Label>
            <Radio.Description>Available on the Enterprise plan</Radio.Description>
          </Radio.Content>
        </Radio.Card>
      </Radio.Group>
    </>
  );
}
