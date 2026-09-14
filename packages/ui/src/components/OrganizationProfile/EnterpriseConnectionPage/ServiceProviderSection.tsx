import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import type { ReactNode } from 'react';

import { ClipboardInput } from '@/elements/ClipboardInput';
import { ProfileSection } from '@/elements/Section';
import { Checkmark, Clipboard } from '@/icons';

import type { LocalizationKey } from '../../../customizables';
import { Col, localizationKeys, Text, useLocalizations } from '../../../customizables';

export const SamlServiceProviderSection = ({
  connection,
}: {
  connection: EnterpriseConnectionResource;
}): JSX.Element | null => {
  const saml = connection.samlConnection;

  if (!saml) {
    return null;
  }

  return (
    <ServiceProviderSectionRoot>
      <CopyableValue
        label={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.acsUrl')}
        value={saml.acsUrl}
      />
      <CopyableValue
        label={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.entityId')}
        value={saml.spEntityId}
      />
      <CopyableValue
        label={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.metadataUrl')}
        value={saml.spMetadataUrl}
      />
    </ServiceProviderSectionRoot>
  );
};

export const OidcServiceProviderSection = ({
  connection,
}: {
  connection: EnterpriseConnectionResource;
}): JSX.Element | null => {
  const redirectUri = connection.oauthConfig?.redirectUri;

  if (!redirectUri) {
    return null;
  }

  return (
    <ServiceProviderSectionRoot>
      <CopyableValue
        label={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.redirectUri')}
        value={redirectUri}
      />
    </ServiceProviderSectionRoot>
  );
};

const ServiceProviderSectionRoot = ({ children }: { children: ReactNode }): JSX.Element => (
  <ProfileSection.Root
    title={localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.title')}
    id='sso'
    centered={false}
  >
    <Col gap={4}>{children}</Col>
  </ProfileSection.Root>
);

const CopyableValue = ({ label, value }: { label: LocalizationKey; value: string }): JSX.Element => {
  const { t } = useLocalizations();

  return (
    <Col gap={1}>
      <Text
        colorScheme='secondary'
        variant='caption'
        localizationKey={label}
      />
      <ClipboardInput
        value={value}
        readOnly
        aria-label={t(label)}
        copyIcon={Clipboard}
        copiedIcon={Checkmark}
      />
    </Col>
  );
};
