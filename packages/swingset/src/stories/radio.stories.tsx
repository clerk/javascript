import { Field } from '@clerk/mosaic/components/field';
import { Icon, IconFrame } from '@clerk/mosaic/components/icon';
import { Radio } from '@clerk/mosaic/components/radio';
import type { IconComponent } from '@clerk/mosaic/icons/glyph';
import { Building } from '@clerk/mosaic/icons/glyphs/building';
import { EnterpriseConnections } from '@clerk/mosaic/icons/glyphs/enterprise-connections';
import { Globe } from '@clerk/mosaic/icons/glyphs/globe';
import { Key } from '@clerk/mosaic/icons/glyphs/key';
import { Lock } from '@clerk/mosaic/icons/glyphs/lock';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './radio.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'stable',
  title: 'Radio',
  source: 'packages/mosaic/src/components/radio/radio.tsx',
};

export function Default() {
  return (
    <Radio.Group
      aria-label='Plan'
      defaultValue='monthly'
    >
      <Field.Root orientation='horizontal'>
        <Radio.Item value='monthly' />
        <Field.Label>Monthly</Field.Label>
      </Field.Root>
      <Field.Root orientation='horizontal'>
        <Radio.Item value='yearly' />
        <Field.Label>Yearly</Field.Label>
      </Field.Root>
    </Radio.Group>
  );
}

export function Descriptions() {
  return (
    <Radio.Group
      aria-label='Repository access'
      defaultValue='all'
    >
      <Field.Root orientation='horizontal'>
        <Radio.Item value='all' />
        <Field.Content>
          <Field.Label>All repositories</Field.Label>
          <Field.Description>Applies to every current and future repository.</Field.Description>
        </Field.Content>
      </Field.Root>
      <Field.Root orientation='horizontal'>
        <Radio.Item value='selected' />
        <Field.Content>
          <Field.Label>Only select repositories</Field.Label>
          <Field.Description>Select at least one repository.</Field.Description>
        </Field.Content>
      </Field.Root>
    </Radio.Group>
  );
}

export function States() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Radio.Item aria-label='Unchecked' />
      <Radio.Item
        aria-label='Checked'
        defaultChecked
      />
      <Radio.Item
        aria-label='Disabled'
        disabled
      />
      <Radio.Item
        aria-label='Disabled checked'
        disabled
        defaultChecked
      />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Radio.Item
        aria-label='Small'
        size='sm'
        defaultChecked
      />
      <Radio.Item
        aria-label='Medium'
        size='md'
        defaultChecked
      />
    </div>
  );
}

export function Cards() {
  return (
    <Radio.Group
      aria-label='Identity provider'
      defaultValue='okta'
      layout='grid'
    >
      {SAML_PROVIDERS.map(provider => (
        <Radio.Card
          key={provider.value}
          value={provider.value}
        >
          <Radio.Media>
            <IconFrame
              filled
              bordered={false}
            >
              <Icon glyph={provider.icon} />
            </IconFrame>
          </Radio.Media>
          <Radio.Content>
            <Radio.Label>{provider.label}</Radio.Label>
            {provider.description ? <Radio.Description>{provider.description}</Radio.Description> : null}
          </Radio.Content>
        </Radio.Card>
      ))}
    </Radio.Group>
  );
}

export function Sections() {
  return (
    <Radio.Group
      aria-label='Identity provider'
      defaultValue='okta'
    >
      <Radio.Section
        label='SAML'
        layout='grid'
      >
        {SAML_PROVIDERS.map(provider => (
          <Radio.Card
            key={provider.value}
            value={provider.value}
          >
            <Radio.Media>
              <IconFrame
                filled
                bordered={false}
              >
                <Icon glyph={provider.icon} />
              </IconFrame>
            </Radio.Media>
            <Radio.Content>
              <Radio.Label>{provider.label}</Radio.Label>
              {provider.description ? <Radio.Description>{provider.description}</Radio.Description> : null}
            </Radio.Content>
          </Radio.Card>
        ))}
      </Radio.Section>
      <Radio.Section
        label='OpenID Connect (OIDC)'
        layout='grid'
      >
        {OIDC_PROVIDERS.map(provider => (
          <Radio.Card
            key={provider.value}
            value={provider.value}
          >
            <Radio.Media>
              <IconFrame
                filled
                bordered={false}
              >
                <Icon glyph={provider.icon} />
              </IconFrame>
            </Radio.Media>
            <Radio.Content>
              <Radio.Label>{provider.label}</Radio.Label>
              {provider.description ? <Radio.Description>{provider.description}</Radio.Description> : null}
            </Radio.Content>
          </Radio.Card>
        ))}
      </Radio.Section>
    </Radio.Group>
  );
}

export function CardsDisabled() {
  return (
    <Radio.Group
      aria-label='Identity provider'
      defaultValue='okta'
      layout='grid'
      disabled
    >
      {SAML_PROVIDERS.map(provider => (
        <Radio.Card
          key={provider.value}
          value={provider.value}
        >
          <Radio.Media>
            <IconFrame
              filled
              bordered={false}
            >
              <Icon glyph={provider.icon} />
            </IconFrame>
          </Radio.Media>
          <Radio.Content>
            <Radio.Label>{provider.label}</Radio.Label>
            {provider.description ? <Radio.Description>{provider.description}</Radio.Description> : null}
          </Radio.Content>
        </Radio.Card>
      ))}
    </Radio.Group>
  );
}

interface Provider {
  value: string;
  label: string;
  description?: string;
  icon: IconComponent;
}

const SAML_PROVIDERS: Provider[] = [
  { value: 'okta', label: 'Okta workforce', description: 'Okta Workforce Identity Cloud.', icon: Key },
  { value: 'entra', label: 'Microsoft Entra (formerly AD)', icon: Building },
  { value: 'google', label: 'Google Workspace', icon: Globe },
  {
    value: 'saml',
    label: 'Custom SAML Provider',
    description: 'Connect any SAML 2.0 identity provider.',
    icon: Lock,
  },
];

const OIDC_PROVIDERS: Provider[] = [
  {
    value: 'oidc',
    label: 'OIDC Provider',
    description: 'Connect any OpenID Connect provider.',
    icon: EnterpriseConnections,
  },
];
