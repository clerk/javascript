import { formatDate } from '@/ui/utils/formatDate';

import { localizationKeys } from '../../../customizables';
import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';
import {
  getIdpCertificateStatus,
  type IdpCertificateEntry,
  toIdpCertificateEntries,
} from '../../ConfigureSSO/domain/idpCertificates';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { buildSamlConfigurationPayload } from '../../ConfigureSSO/steps/ConfigureStep/saml/shared/IdentityProviderConfigurationForm';
import type { OidcIdpConfigurationMode } from '../../ConfigureSSO/steps/ConfigureStep/shared/IdentityProviderConfigurationModes';
import type { Detail, IdentityProviderSectionProps } from './identity-provider-section.types';

const samlDetails = (connection: SSOConnection): Detail[] => {
  const saml = connection.samlConnection;

  const details: Detail[] = saml?.idpMetadataUrl
    ? [
        {
          id: 'idpMetadataUrl',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.metadataUrl.label',
          ),
          value: saml.idpMetadataUrl,
        },
      ]
    : [
        {
          id: 'idpSsoUrl',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.signOnUrl.label',
          ),
          value: saml?.idpSsoUrl ?? '',
        },
        {
          id: 'idpEntityId',
          label: localizationKeys(
            'configureSSO.configureStep.samlCustom.identityProviderMetadataStep.manual.issuer.label',
          ),
          value: saml?.idpEntityId ?? '',
        },
      ];

  const certificates = toIdpCertificateEntries(saml);
  if (certificates.length > 0) {
    details.push(certificatesDetail(certificates));
  }

  return details;
};

const toneFor = (entry: IdpCertificateEntry): Detail['tone'] => {
  const status = getIdpCertificateStatus(entry);
  return status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : undefined;
};

const certificatesDetail = (certificates: IdpCertificateEntry[]): Detail => {
  const dated = certificates.filter(entry => entry.expiresAt !== null);
  const earliest = dated.length > 0 ? dated.reduce((a, b) => ((b.expiresAt ?? 0) < (a.expiresAt ?? 0) ? b : a)) : null;

  if (certificates.length === 1) {
    const [only] = certificates;
    return {
      id: 'idpCertificateExpiresAt',
      label: localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.certificateExpires'),
      value: only.expiresAt === null ? undefined : formatDate(new Date(only.expiresAt)),
      tone: toneFor(only),
    };
  }

  const count = certificates.length;
  if (!earliest || earliest.expiresAt === null) {
    return {
      id: 'idpCertificates',
      label: localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.certificates'),
      valueKey: localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.certificatesCount', {
        count,
      }),
    };
  }

  const expired = getIdpCertificateStatus(earliest) === 'expired';
  return {
    id: 'idpCertificates',
    label: localizationKeys('organizationProfile.securityPage.connectionPage.identityProvider.certificates'),
    valueKey: localizationKeys(
      expired
        ? 'organizationProfile.securityPage.connectionPage.identityProvider.certificatesSummaryExpired'
        : 'organizationProfile.securityPage.connectionPage.identityProvider.certificatesSummary',
      { count, date: formatDate(new Date(earliest.expiresAt)) },
    ),
    tone: toneFor(earliest),
  };
};

const oidcDetails = (connection: SSOConnection): Detail[] => {
  const oauthConfig = connection.oauthConfig;

  return [
    {
      id: 'clientId',
      label: localizationKeys('configureSSO.configureStep.oidcCustom.credentialsStep.clientId.label'),
      value: oauthConfig?.clientId ?? '',
    },
    ...(oauthConfig?.discoveryUrl
      ? [
          {
            id: 'discoveryUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.discoveryUrl.label'),
            value: oauthConfig.discoveryUrl,
          },
        ]
      : [
          {
            id: 'authUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.authUrl.label'),
            value: oauthConfig?.authUrl ?? '',
          },
          {
            id: 'tokenUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.tokenUrl.label'),
            value: oauthConfig?.tokenUrl ?? '',
          },
          {
            id: 'userInfoUrl',
            label: localizationKeys('configureSSO.configureStep.oidcCustom.endpointsStep.manual.userInfoUrl.label'),
            value: oauthConfig?.userInfoUrl ?? '',
          },
        ]),
  ];
};

export const useIdentityProviderSectionModel = ({ connection }: IdentityProviderSectionProps) => {
  const isOidc = isOidcProvider(connection.provider);
  return { isOidc, details: isOidc ? oidcDetails(connection) : samlDetails(connection) };
};

export const useSamlIdentityProviderModel = ({ connection, updateConnection }: IdentityProviderSectionProps) => {
  const saml = connection.samlConnection;
  return {
    idpMetadataUrl: saml?.idpMetadataUrl ?? '',
    idpSsoUrl: saml?.idpSsoUrl ?? '',
    idpEntityId: saml?.idpEntityId ?? '',
    initialCertificates: toIdpCertificateEntries(saml),
    update: async (values: Parameters<typeof buildSamlConfigurationPayload>[0]) => {
      const payload = await buildSamlConfigurationPayload(values);
      return updateConnection(connection.id, { saml: payload });
    },
  };
};

export const useOidcIdentityProviderModel = ({ connection, updateConnection }: IdentityProviderSectionProps) => {
  const oauthConfig = connection.oauthConfig;
  return {
    clientId: oauthConfig?.clientId ?? '',
    discoveryUrl: oauthConfig?.discoveryUrl ?? '',
    authUrl: oauthConfig?.authUrl ?? '',
    tokenUrl: oauthConfig?.tokenUrl ?? '',
    userInfoUrl: oauthConfig?.userInfoUrl ?? '',
    update: ({
      mode,
      clientId,
      clientSecret,
      discoveryUrl,
      authUrl,
      tokenUrl,
      userInfoUrl,
    }: {
      mode: OidcIdpConfigurationMode;
      clientId: string;
      clientSecret: string;
      discoveryUrl: string;
      authUrl: string;
      tokenUrl: string;
      userInfoUrl: string;
    }) =>
      updateConnection(connection.id, {
        oidc: {
          clientId: clientId.trim(),
          clientSecret: clientSecret.trim() || undefined,
          ...(mode === 'discoveryUrl'
            ? { discoveryUrl: discoveryUrl.trim() }
            : {
                authUrl: authUrl.trim(),
                tokenUrl: tokenUrl.trim(),
                userInfoUrl: userInfoUrl.trim(),
              }),
        },
      }),
  };
};
