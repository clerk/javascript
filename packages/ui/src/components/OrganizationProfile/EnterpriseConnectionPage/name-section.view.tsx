import type React from 'react';

import { Action } from '@/elements/Action';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';

import { localizationKeys, Text } from '../../../customizables';
import type { useNameFormController } from './name-section.controller';

export const NameSectionView = ({ name, form }: { name: string; form: React.ReactNode }) => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.name.title')}
    id='ssoConnectionName'
    centered={false}
  >
    <Action.Root>
      <Action.Closed value='name'>
        <ProfileSection.Item id='ssoConnectionName'>
          <Text>{name}</Text>
          <Action.Trigger value='name'>
            <ProfileSection.Button
              id='ssoConnectionName'
              localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.name.editButton')}
            />
          </Action.Trigger>
        </ProfileSection.Item>
      </Action.Closed>
      <Action.Open value='name'>
        <Action.Card>{form}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);

export const NameFormView = ({
  nameField,
  onSubmit,
  onReset,
  isDisabled,
}: ReturnType<typeof useNameFormController>) => (
  <FormContainer headerTitle={localizationKeys('organizationProfile.securityPage.connectionPage.name.form.title')}>
    <Form.Root onSubmit={onSubmit}>
      <Form.ControlRow elementId={nameField.id}>
        <Form.PlainInput
          {...nameField.props}
          autoFocus
          ignorePasswordManager
        />
      </Form.ControlRow>
      <FormButtons
        isDisabled={isDisabled}
        onReset={onReset}
      />
    </Form.Root>
  </FormContainer>
);
