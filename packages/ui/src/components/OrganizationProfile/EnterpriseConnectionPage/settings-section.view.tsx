import type React from 'react';

import { Card } from '@/elements/Card';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { ProfileSection } from '@/elements/Section';

import { localizationKeys } from '../../../customizables';
import type { useSettingsFormController } from './settings-section.controller';

export const SettingsSectionView = ({ form }: { form: React.ReactNode }) => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.settings.title')}
    id='ssoConnectionSettings'
    centered={false}
  >
    {form}
  </ProfileSection.Root>
);

export const SettingsFormView = ({
  fields,
  applicable,
  error,
  isDisabled,
  onReset,
  onSubmit,
}: ReturnType<typeof useSettingsFormController>) => (
  <Form.Root onSubmit={onSubmit}>
    {applicable.map(id => (
      <Form.ControlRow
        key={id}
        elementId={id}
      >
        <Form.Checkbox
          {...fields[id].props}
          description={localizationKeys(`organizationProfile.securityPage.connectionPage.settings.${id}.description`)}
        />
      </Form.ControlRow>
    ))}

    <Card.Alert>{error}</Card.Alert>

    <FormButtons
      isDisabled={isDisabled}
      onReset={onReset}
    />
  </Form.Root>
);
