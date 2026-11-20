import { __internal_useOrganizationEnterpriseConnections, useOrganization } from '@clerk/shared/react';
import type {
  EnterpriseConnectionResource,
  OrganizationEnterpriseConnectionOidcInput,
  OrganizationEnterpriseConnectionSamlInput,
  UpdateOrganizationEnterpriseConnectionParams,
} from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useOrganizationRolesQuery } from '../../../queries/use-organization-roles-query';
import { save } from '../../../utils/errors';
import { isMonochromeProvider, providerId } from '../../user-profile/user-profile-provider.utils';
import { haveCertificatesChanged } from './sso-certificates.utils';
import type {
  SSOCertificate,
  SSOConnection,
  SSOConnectionSetting,
  SSOOidcValues,
  SSOSamlValues,
} from './sso-connections.types';
import { connectionStatus, providerIconUrl, providerKey, sortConnections } from './sso-connections.utils';

export interface SSOEnrollmentRole {
  key: string;
  name: string | undefined;
}

export interface SSOConnectionsModel {
  organizationName: string;
  connections: SSOConnection[];
  isLoading: boolean;
  isError: boolean;
  enrollmentRole: SSOEnrollmentRole | undefined;
  retry: () => void;
  rename: (id: string, name: string) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
  setSetting: (id: string, setting: SSOConnectionSetting, enabled: boolean) => Promise<void>;
  updateSaml: (id: string, values: SSOSamlValues) => Promise<void>;
  updateOidc: (id: string, values: SSOOidcValues) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const SETTING_PARAMS: Record<SSOConnectionSetting, (enabled: boolean) => UpdateOrganizationEnterpriseConnectionParams> =
  {
    syncUserAttributes: syncUserAttributes => ({ syncUserAttributes }),
    allowAdditionalIdentifiers: enabled => ({ disableAdditionalIdentifications: !enabled }),
    allowSubdomains: allowSubdomains => ({ saml: { allowSubdomains } }),
    allowIdpInitiated: allowIdpInitiated => ({ saml: { allowIdpInitiated } }),
    forceAuthn: forceAuthn => ({ saml: { forceAuthn } }),
  };

export function useSSOConnectionsModel({ enabled }: { enabled: boolean }): SSOConnectionsModel {
  const { organization } = useOrganization();
  const source = __internal_useOrganizationEnterpriseConnections({ enabled });
  const environment = useMosaicEnvironment();
  const defaultRole = environment?.organizationSettings.domains.defaultRole ?? undefined;
  const rolesQuery = useOrganizationRolesQuery({ enabled });
  const roles = rolesQuery.data?.data ?? [];
  const roleKey = defaultRole ?? (roles.length === 1 ? roles[0]?.key : undefined);
  const resources = sortConnections(source.data ?? []);
  const connections = resources.map(toSSOConnection);

  const update = async (id: string, params: UpdateOrganizationEnterpriseConnectionParams) => {
    await source.updateEnterpriseConnection(id, params);
  };

  const original = (id: string) => connections.find(connection => connection.id === id);

  return {
    organizationName: organization?.name ?? '',
    connections,
    isLoading: source.isLoading,
    isError: Boolean(source.error) && !source.data,
    enrollmentRole: roleKey ? { key: roleKey, name: roles.find(role => role.key === roleKey)?.name } : undefined,
    retry: () => void source.revalidate(),
    rename: (id, name) => save(() => update(id, { name: name.trim() }), ['name']),
    setActive: (id, active) => update(id, { active }),
    setSetting: (id, setting, value) => update(id, SETTING_PARAMS[setting](value)),
    updateSaml: (id, values) => {
      const current = original(id);
      const certificates = current?.family === 'saml' ? current.saml.certificates : [];
      return save(() => update(id, { saml: toSamlInput(values, certificates) }));
    },
    updateOidc: (id, values) => save(() => update(id, { oidc: toOidcInput(values) })),
    remove: async id => {
      await source.deleteEnterpriseConnection(id);
    },
  };
}

function toSSOConnection(connection: EnterpriseConnectionResource): SSOConnection {
  const base = {
    id: connection.id,
    name: connection.name,
    domains: connection.domains,
    providerKey: providerKey(connection.provider),
    iconUrl: providerIconUrl(connection),
    monochromeIcon: isMonochromeProvider(providerId(connection.provider)),
    status: connectionStatus(connection),
  };
  const shared = {
    syncUserAttributes: Boolean(connection.syncUserAttributes),
    allowAdditionalIdentifiers: !connection.disableAdditionalIdentifications,
  };
  if (base.providerKey === 'oidc') {
    const config = connection.oauthConfig;
    return {
      ...base,
      family: 'oidc',
      settings: shared,
      oidc: {
        redirectUri: config?.redirectUri ?? '',
        clientId: config?.clientId ?? '',
        discoveryUrl: config?.discoveryUrl ?? '',
        authUrl: config?.authUrl ?? '',
        tokenUrl: config?.tokenUrl ?? '',
        userInfoUrl: config?.userInfoUrl ?? '',
      },
    };
  }
  const saml = connection.samlConnection;
  return {
    ...base,
    family: 'saml',
    settings: {
      ...shared,
      allowSubdomains: Boolean(saml?.allowSubdomains),
      allowIdpInitiated: Boolean(saml?.allowIdpInitiated),
      forceAuthn: Boolean(saml?.forceAuthn),
    },
    saml: {
      acsUrl: saml?.acsUrl ?? '',
      spEntityId: saml?.spEntityId ?? '',
      spMetadataUrl: saml?.spMetadataUrl ?? '',
      idpMetadataUrl: saml?.idpMetadataUrl ?? '',
      idpSsoUrl: saml?.idpSsoUrl ?? '',
      idpEntityId: saml?.idpEntityId ?? '',
      certificates: toCertificates(saml),
    },
  };
}

function toCertificates(saml: EnterpriseConnectionResource['samlConnection']): SSOCertificate[] {
  if (saml?.idpCertificates?.length) {
    return saml.idpCertificates.map(({ certificate, expiresAt }) => ({ certificate, expiresAt }));
  }
  if (saml?.idpCertificate) {
    return [{ certificate: saml.idpCertificate, expiresAt: saml.idpCertificateExpiresAt || null }];
  }
  return [];
}

function toSamlInput(values: SSOSamlValues, original: SSOCertificate[]): OrganizationEnterpriseConnectionSamlInput {
  if (values.mode === 'metadataUrl') {
    return { idpMetadataUrl: values.idpMetadataUrl.trim() };
  }
  return {
    idpSsoUrl: values.idpSsoUrl.trim(),
    idpEntityId: values.idpEntityId.trim(),
    ...(haveCertificatesChanged(values.certificates, original)
      ? { idpCertificates: values.certificates.map(entry => entry.certificate) }
      : {}),
  };
}

function toOidcInput(values: SSOOidcValues): OrganizationEnterpriseConnectionOidcInput {
  return {
    clientId: values.clientId.trim(),
    clientSecret: values.clientSecret.trim() || undefined,
    ...(values.mode === 'discoveryUrl'
      ? { discoveryUrl: values.discoveryUrl.trim() }
      : {
          authUrl: values.authUrl.trim(),
          tokenUrl: values.tokenUrl.trim(),
          userInfoUrl: values.userInfoUrl.trim(),
        }),
  };
}
