import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type React from 'react';
import type { ReactNode } from 'react';

import { Action } from '@/elements/Action';
import { useActionContext } from '@/elements/Action/ActionRoot';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtons } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { ProfileSection } from '@/elements/Section';
import { formatDate } from '@/ui/utils/formatDate';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import type { LocalizationKey } from '../../../customizables';
import { Badge, descriptors, Flex, localizationKeys, Text } from '../../../customizables';
import { providerLabel, toProviderCard } from '../../ConfigureSSO/domain/providers';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';
import type { EnterpriseConnectionProviderType } from '../../ConfigureSSO/types';

type GeneralSectionProps = {
  connection: EnterpriseConnectionResource;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
};

export const GeneralSection = ({ connection, updateConnection }: GeneralSectionProps): JSX.Element => {
  const label = providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType));

  return (
    <ProfileSection.Root
      title={localizationKeys('organizationProfile.securityPage.connectionPage.general.title')}
      id='sso'
      centered={false}
    >
      <ProfileSection.ItemList id='sso'>
        <NameRow
          connection={connection}
          updateConnection={updateConnection}
        />

        <DetailRow label={localizationKeys('organizationProfile.securityPage.connectionPage.general.domainsLabel')}>
          {connection.domains.map(domain => (
            <Badge
              key={domain}
              elementDescriptor={descriptors.organizationProfileSecuritySsoDetailRowChip}
            >
              {domain}
            </Badge>
          ))}
        </DetailRow>

        <DetailRow label={localizationKeys('organizationProfile.securityPage.connectionPage.general.providerLabel')}>
          {label && <Text localizationKey={label} />}
        </DetailRow>

        <DetailRow label={localizationKeys('organizationProfile.securityPage.connectionPage.general.createdLabel')}>
          {connection.createdAt && <Text>{formatDate(connection.createdAt)}</Text>}
        </DetailRow>
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};

const DetailRow = ({ label, children }: { label: LocalizationKey; children: ReactNode }): JSX.Element => (
  <ProfileSection.Item id='sso'>
    <Text
      colorScheme='secondary'
      localizationKey={label}
      sx={{ flexShrink: 0 }}
    />
    <Flex
      align='center'
      justify='end'
      wrap='wrap'
      sx={t => ({ minWidth: 0, gap: t.space.$1x5 })}
    >
      {children}
    </Flex>
  </ProfileSection.Item>
);

const NameRow = ({ connection, updateConnection }: GeneralSectionProps): JSX.Element => (
  <Action.Root>
    <Action.Closed value='name'>
      <DetailRow label={localizationKeys('organizationProfile.securityPage.connectionPage.general.nameLabel')}>
        <Text sx={{ minWidth: 0 }}>{connection.name}</Text>

        <Action.Trigger value='name'>
          <ProfileSection.Button
            id='sso'
            localizationKey={localizationKeys('organizationProfile.securityPage.connectionPage.general.editNameButton')}
          />
        </Action.Trigger>
      </DetailRow>
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
);

const NameScreen = (props: GeneralSectionProps): JSX.Element => {
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
  }: GeneralSectionProps & { onSuccess: () => void; onReset: () => void }): JSX.Element => {
    const card = useCardState();
    const nameField = useFormControl('name', connection.name, {
      type: 'text',
      label: localizationKeys('organizationProfile.securityPage.connectionPage.general.nameLabel'),
      isRequired: true,
    });

    const name = nameField.value.trim();
    const canSubmit = name.length > 0 && name !== connection.name;

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!canSubmit) {
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
      <FormContainer
        headerTitle={localizationKeys('organizationProfile.securityPage.connectionPage.general.nameForm.title')}
      >
        <Form.Root onSubmit={onSubmit}>
          <Form.ControlRow elementId={nameField.id}>
            <Form.PlainInput
              {...nameField.props}
              autoFocus
              ignorePasswordManager
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>
    );
  },
);
