import type { EnterpriseConnectionResource, UpdateOrganizationEnterpriseConnectionParams } from '@clerk/shared/types';

import { useCardState } from '@/elements/contexts';
import { ProfileSection } from '@/elements/Section';
import { Switch } from '@/elements/Switch';
import { handleError } from '@/utils/errorHandler';

import { Col, localizationKeys, Text } from '../../../customizables';
import type { EnterpriseConnectionMutations } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnection';

export type ProviderFamily = 'saml' | 'oidc';

type SettingId =
  | 'syncUserAttributes'
  | 'allowAdditionalIdentifiers'
  | 'allowSubdomains'
  | 'allowIdpInitiated'
  | 'forceAuthn';

type Setting = {
  id: SettingId;
  appliesTo: 'all' | ProviderFamily;
  isChecked: (connection: EnterpriseConnectionResource) => boolean;
  toParams: (checked: boolean) => UpdateOrganizationEnterpriseConnectionParams;
};

const SETTINGS: ReadonlyArray<Setting> = [
  {
    id: 'syncUserAttributes',
    appliesTo: 'all',
    isChecked: connection => connection.syncUserAttributes,
    toParams: syncUserAttributes => ({ syncUserAttributes }),
  },
  {
    id: 'allowAdditionalIdentifiers',
    appliesTo: 'all',
    isChecked: connection => !connection.disableAdditionalIdentifications,
    toParams: checked => ({ disableAdditionalIdentifications: !checked }),
  },
  {
    id: 'allowSubdomains',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.allowSubdomains),
    toParams: allowSubdomains => ({ saml: { allowSubdomains } }),
  },
  {
    id: 'allowIdpInitiated',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.allowIdpInitiated),
    toParams: allowIdpInitiated => ({ saml: { allowIdpInitiated } }),
  },
  {
    id: 'forceAuthn',
    appliesTo: 'saml',
    isChecked: connection => Boolean(connection.samlConnection?.forceAuthn),
    toParams: forceAuthn => ({ saml: { forceAuthn } }),
  },
];

type SettingsSectionProps = {
  connection: EnterpriseConnectionResource;
  family: ProviderFamily;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
};

export const SettingsSection = ({ connection, family, updateConnection }: SettingsSectionProps): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.settings.title')}
    id='sso'
    centered={false}
  >
    <Col gap={4}>
      {SETTINGS.filter(setting => setting.appliesTo === 'all' || setting.appliesTo === family).map(setting => (
        <SettingRow
          key={setting.id}
          setting={setting}
          connection={connection}
          updateConnection={updateConnection}
        />
      ))}
    </Col>
  </ProfileSection.Root>
);

const SettingRow = ({
  setting,
  connection,
  updateConnection,
}: {
  setting: Setting;
  connection: EnterpriseConnectionResource;
  updateConnection: EnterpriseConnectionMutations['updateConnection'];
}): JSX.Element => {
  const card = useCardState();

  const onChange = async (checked: boolean) => {
    card.setError(undefined);
    card.setLoading();

    try {
      await updateConnection(connection.id, setting.toParams(checked));
    } catch (err) {
      handleError(err as Error, [], card.setError);
    } finally {
      card.setIdle();
    }
  };

  return (
    <Col gap={1}>
      <Switch
        isChecked={setting.isChecked(connection)}
        isDisabled={card.isLoading}
        onChange={checked => void onChange(checked)}
        label={localizationKeys(`organizationProfile.securityPage.connectionPage.settings.${setting.id}.label`)}
      />
      <Text
        colorScheme='secondary'
        variant='caption'
        localizationKey={localizationKeys(
          `organizationProfile.securityPage.connectionPage.settings.${setting.id}.description`,
        )}
      />
    </Col>
  );
};
