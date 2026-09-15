import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type React from 'react';

import { Action } from '@/elements/Action';
import { useActionContext } from '@/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { localizationKeys, Text } from '../../../customizables';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

type NameSectionProps = {
  connection: EnterpriseConnectionResource;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
};

export const NameSection = ({ connection, updateConnection }: NameSectionProps): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.name.title')}
    id='sso'
    centered={false}
  >
    <Action.Root>
      <Action.Closed value='name'>
        <ProfileSection.Item id='sso'>
          <Text>{connection.name}</Text>

          <Action.Trigger value='name'>
            <ProfileSection.Button
              id='sso'
              localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.name.editButton')}
            />
          </Action.Trigger>
        </ProfileSection.Item>
      </Action.Closed>

      <Action.Open value='name'>
        <Action.Card>
          <NameScreen
            connection={connection}
            updateConnection={updateConnection}
          />
        </Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);

const NameScreen = (props: NameSectionProps): JSX.Element => {
  const { close } = useActionContext();

  return (
    <NameForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  );
};

const NameForm = withCardStateProvider(
  ({
    connection,
    updateConnection,
    onSuccess,
    onReset,
  }: NameSectionProps & { onSuccess: () => void; onReset: () => void }): JSX.Element => {
    const card = useCardState();
    const nameField = useFormControl('name', connection.name, {
      type: 'text',
      label: localizationKeys('organizationProfile.securityPage.connectionPage.name.title'),
      isRequired: true,
    });

    const name = nameField.value.trim();
    const canSubmit = name.length > 0 && name !== connection.name;

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit || card.isLoading) {
        return;
      }

      try {
        await updateConnection(connection.id, { name });
        onSuccess();
      } catch (err) {
        handleError(err as Error, [nameField], card.setError);
      }
    };

    return (
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
            isDisabled={!canSubmit || card.isLoading}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);
