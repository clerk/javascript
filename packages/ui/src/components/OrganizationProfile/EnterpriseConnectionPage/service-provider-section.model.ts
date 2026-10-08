import type { LocalizationKey } from '../../../customizables';
import { localizationKeys } from '../../../customizables';
import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';

export type ServiceProviderValue = { label: LocalizationKey; value: string };

export const useSamlServiceProviderModel = (connection: SSOConnection): ServiceProviderValue[] | null => {
  const saml = connection.samlConnection;
  if (!saml) {
    return null;
  }
  return [
    {
      label: localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.acsUrl'),
      value: saml.acsUrl,
    },
    {
      label: localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.entityId'),
      value: saml.spEntityId,
    },
    {
      label: localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.metadataUrl'),
      value: saml.spMetadataUrl,
    },
  ];
};

export const useOidcServiceProviderModel = (connection: SSOConnection): ServiceProviderValue[] | null => {
  const redirectUri = connection.oauthConfig?.redirectUri;
  if (!redirectUri) {
    return null;
  }
  return [
    {
      label: localizationKeys('organizationProfile.securityPage.connectionPage.serviceProvider.redirectUri'),
      value: redirectUri,
    },
  ];
};
