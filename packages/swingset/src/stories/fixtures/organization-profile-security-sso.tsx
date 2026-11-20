import { Card } from '@clerk/mosaic/components/card';
import { SSOConnectionCardContent } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-connection.dialog';
import type { SSOConnectionsModel } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-connections.model';
import type {
  SSOConnection,
  SSOConnectionSetting,
} from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-connections.types';
import { SSOSectionContent } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-section';
import { SSOSectionSkeleton } from '@clerk/mosaic/features/organization-profile/organization-profile-security-panel/sso-section.skeleton';
import { save } from '@clerk/mosaic/utils/errors';
import { iconImageUrl } from '@clerk/shared/constants';
import { ClerkRuntimeError } from '@clerk/shared/error';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName, chaosRows } from '@/lib/chaos';

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 600));
const DAY = 24 * 60 * 60 * 1000;
const FIXED_NOW = Date.UTC(2026, 10, 18);

const exampleConnections: SSOConnection[] = [
  {
    id: 'ent_okta',
    name: 'Acme Okta',
    domains: ['acme.com', 'acme.io'],
    providerKey: 'okta',
    iconUrl: iconImageUrl('okta'),
    monochromeIcon: true,
    status: 'active',
    family: 'saml',
    settings: {
      syncUserAttributes: true,
      allowAdditionalIdentifiers: true,
      allowSubdomains: false,
      allowIdpInitiated: true,
      forceAuthn: false,
    },
    saml: {
      acsUrl: 'https://clerk.acme.com/v1/saml/acs/ent_okta',
      spEntityId: 'https://clerk.acme.com/saml/ent_okta',
      spMetadataUrl: 'https://clerk.acme.com/v1/saml/metadata/ent_okta',
      idpMetadataUrl: '',
      idpSsoUrl: 'https://acme.okta.com/app/acme_clerk/exk1/sso/saml',
      idpEntityId: 'http://www.okta.com/exk1',
      certificates: [
        {
          certificate: 'MIIDqDCCApCgAwIBAgIGAYxR0vUbMA0GCSqGSIb3DQEBCwUAMIGUMQswCQYDVQQGEwJVUzETMBEGA1UE',
          expiresAt: FIXED_NOW + 20 * DAY,
        },
        {
          certificate: 'MIIDpDCCAoygAwIBAgIGAZB3c8RkMA0GCSqGSIb3DQEBCwUAMIGSMQswCQYDVQQGEwJVUzETMBEGA1UE',
          expiresAt: FIXED_NOW + 400 * DAY,
        },
      ],
    },
  },
  {
    id: 'ent_entra',
    name: 'Contractors Entra',
    domains: ['contractors.acme.com'],
    providerKey: 'microsoft',
    iconUrl: iconImageUrl('microsoft'),
    monochromeIcon: false,
    status: 'inactive',
    family: 'saml',
    settings: {
      syncUserAttributes: false,
      allowAdditionalIdentifiers: true,
      allowSubdomains: true,
      allowIdpInitiated: false,
      forceAuthn: true,
    },
    saml: {
      acsUrl: 'https://clerk.acme.com/v1/saml/acs/ent_entra',
      spEntityId: 'https://clerk.acme.com/saml/ent_entra',
      spMetadataUrl: 'https://clerk.acme.com/v1/saml/metadata/ent_entra',
      idpMetadataUrl: 'https://login.microsoftonline.com/acme/federationmetadata/2007-06/federationmetadata.xml',
      idpSsoUrl: 'https://login.microsoftonline.com/acme/saml2',
      idpEntityId: 'https://sts.windows.net/acme/',
      certificates: [],
    },
  },
  {
    id: 'ent_oidc',
    name: 'Partner OIDC',
    domains: [],
    providerKey: 'oidc',
    iconUrl: iconImageUrl('oidc'),
    monochromeIcon: false,
    status: 'inProgress',
    family: 'oidc',
    settings: { syncUserAttributes: false, allowAdditionalIdentifiers: false },
    oidc: {
      redirectUri: 'https://clerk.acme.com/v1/oauth_callback',
      clientId: '',
      discoveryUrl: '',
      authUrl: '',
      tokenUrl: '',
      userInfoUrl: '',
    },
  },
];

const SETTING_REJECTED = new ClerkRuntimeError('The connection could not be updated.', { code: 'form_param_invalid' });

export function useSSOConnectionsFixture({
  initialIds = exampleConnections.map(connection => connection.id),
  isLoading = false,
  isError = false,
}: { initialIds?: string[]; isLoading?: boolean; isError?: boolean } = {}): SSOConnectionsModel {
  const seed = useChaosFixture(
    exampleConnections.filter(connection => initialIds.includes(connection.id)),
    items => chaosRows(items, 12).map((connection, index) => ({ ...connection, name: chaosName(index) })),
  );
  const [connections, setConnections] = useState(seed);

  const patch = async (id: string, change: (connection: SSOConnection) => SSOConnection) => {
    await delay();
    setConnections(current => current.map(connection => (connection.id === id ? change(connection) : connection)));
  };

  return {
    organizationName: 'Acme',
    connections,
    isLoading,
    isError,
    isRetrying: false,
    enrollmentRole: { key: 'org:member', name: 'Member' },
    retry: () => undefined,
    rename: (id, name) => save(() => patch(id, connection => ({ ...connection, name: name.trim() })), ['name']),
    setActive: (id, active) => patch(id, connection => ({ ...connection, status: active ? 'active' : 'inactive' })),
    setSetting: async (id, setting: SSOConnectionSetting, enabled) => {
      if (setting === 'forceAuthn' && enabled && id === 'ent_okta') {
        await delay();
        throw SETTING_REJECTED;
      }
      await patch(id, connection => ({ ...connection, settings: { ...connection.settings, [setting]: enabled } }));
    },
    updateSaml: (id, values) =>
      save(() =>
        patch(id, connection =>
          connection.family === 'saml'
            ? {
                ...connection,
                saml: {
                  ...connection.saml,
                  idpMetadataUrl: values.mode === 'metadataUrl' ? values.idpMetadataUrl : '',
                  idpSsoUrl: values.idpSsoUrl,
                  idpEntityId: values.idpEntityId,
                  certificates: values.certificates,
                },
              }
            : connection,
        ),
      ),
    updateOidc: (id, values) =>
      save(() =>
        patch(id, connection =>
          connection.family === 'oidc'
            ? {
                ...connection,
                status: 'inactive',
                oidc: {
                  ...connection.oidc,
                  clientId: values.clientId,
                  discoveryUrl: values.mode === 'discoveryUrl' ? values.discoveryUrl : '',
                  authUrl: values.authUrl,
                  tokenUrl: values.tokenUrl,
                  userInfoUrl: values.userInfoUrl,
                },
              }
            : connection,
        ),
      ),
    remove: async id => {
      await delay();
      setConnections(current => current.filter(connection => connection.id !== id));
    },
  };
}

export function SSOSectionExample(props: Parameters<typeof useSSOConnectionsFixture>[0] = {}) {
  const model = useSSOConnectionsFixture(props);
  return model.isLoading ? <SSOSectionSkeleton /> : <SSOSectionContent model={model} />;
}

export function SSOConnectionExample({ id = 'ent_okta' }: { id?: string }) {
  const model = useSSOConnectionsFixture();
  const connection = model.connections.find(item => item.id === id);
  if (!connection) {
    return null;
  }
  return (
    <Card.Root
      size='lg'
      renderBranding={false}
    >
      <SSOConnectionCardContent
        connection={connection}
        onRename={name => model.rename(id, name)}
        onSetSetting={(setting, enabled) => model.setSetting(id, setting, enabled)}
        onUpdateSaml={values => model.updateSaml(id, values)}
        onUpdateOidc={values => model.updateOidc(id, values)}
      />
    </Card.Root>
  );
}
