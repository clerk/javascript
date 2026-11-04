import { useAccessController } from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.controller';
import type {
  AccessConnection,
  AccessData,
  AccessPolicy,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.types';
import {
  newConnection,
  newPolicy,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.utils';
import {
  AccessBackAction,
  AccessFooter,
  OrganizationProfileAccessPanelView,
} from '@clerk/mosaic/features/organization-profile/organization-profile-access-panel/access.view';
import { useMessages } from '@clerk/mosaic/localization';
import { SaveError } from '@clerk/mosaic/utils/errors';
import { useState } from 'react';

const settle = () => new Promise<void>(resolve => setTimeout(resolve, 500));
const initialConnections: AccessConnection[] = [
  {
    id: 'sso_okta',
    kind: 'sso',
    configuration: { ...newConnection(), name: 'Okta Engineering', metadataUrl: 'https://example.com/metadata.xml' },
  },
  {
    id: 'sso_entra',
    kind: 'sso',
    status: 'inactive',
    configuration: { ...newConnection(), name: 'Microsoft Entra', provider: 'entra' },
  },
  {
    id: 'sso_okta_marketing',
    kind: 'sso',
    configuration: { ...newConnection(), name: 'Okta Marketing', metadataUrl: 'https://example.com/marketing.xml' },
  },
  {
    id: 'directory_okta',
    kind: 'directory',
    configuration: { ...newConnection(), name: 'Okta Directory', ssoConnectionId: 'sso_okta' },
  },
];
const initialPolicies: AccessPolicy[] = [
  {
    ...newPolicy(),
    id: 'policy_active',
    status: 'active',
    domains: [{ name: 'acmedev.org', verified: true }],
    authentication: 'sso',
    ssoConnectionIds: ['sso_okta'],
    enrollment: 'directory',
    directoryConnectionId: 'directory_okta',
  },
  {
    ...newPolicy(),
    id: 'policy_inactive',
    status: 'inactive',
    domains: [{ name: 'acme.com', verified: true }],
    authentication: 'sso',
    ssoConnectionIds: ['sso_entra'],
    enrollment: 'automatic',
  },
  { ...newPolicy(), id: 'policy_draft', domains: [{ name: 'acmestudio.com', verified: false }], enrollment: 'request' },
];

export function useOrganizationProfileAccessFixture({
  empty = false,
  failSave = false,
  failTest = false,
  failVerification = false,
} = {}) {
  const [policies, setPolicies] = useState<AccessPolicy[]>(empty ? [] : initialPolicies);
  const [connections, setConnections] = useState<AccessConnection[]>(empty ? [] : initialConnections);
  const m = useMessages('organizationProfile').access;
  const data: AccessData = {
    policies,
    connections,
    serviceProvider: {
      signOnUrl: 'https://example.com/saml/sso',
      audience: 'https://example.com/saml/metadata',
      redirectUri: 'https://example.com/oauth/callback',
      scimUrl: 'https://example.com/scim/v2',
      token: 'mock_scim_token_preview_only',
      dnsValue: 'clerk-domain-verification=preview',
      testUrl: 'https://example.com/sso/test',
    },
    onSavePolicy: async policy => {
      await settle();
      if (failSave) {
        throw new SaveError({ global: { code: 'fixture_error', message: 'The policy could not be saved.' } });
      }
      const saved = { ...policy, id: policy.id || crypto.randomUUID() };
      setPolicies(current => [...current.filter(item => item.id !== saved.id), saved]);
    },
    onSaveConnection: async (kind, configuration, id) => {
      await settle();
      if (failSave) {
        throw new SaveError({ global: { code: 'fixture_error', message: 'The connection could not be saved.' } });
      }
      const saved: AccessConnection = {
        id: id ?? crypto.randomUUID(),
        status: connections.find(connection => connection.id === id)?.status ?? 'active',
        kind,
        configuration: { ...configuration, clientSecret: '', metadataFile: null, serviceAccountFile: null },
      };
      setConnections(current => [...current.filter(item => item.id !== saved.id), saved]);
      return saved;
    },
    onTestConnection: async () => {
      await settle();
      return {
        success: !failTest,
        email: failTest ? undefined : 'john@example.com',
        firstName: 'John',
        lastName: 'Smith',
        groups: ['Engineering'],
      };
    },
    onVerifyDomain: async () => {
      await settle();
      return !failVerification;
    },
  };
  const controller = useAccessController(data);
  const editing = controller.step === 'editor';
  const directory = controller.request?.kind === 'directory';
  const contentTitle = directory
    ? controller.wizard.editing
      ? m.manageDirectory
      : m.directoryTitle
    : editing
      ? controller.form.values.id
        ? m.managePolicy
        : m.addPolicy
      : m.title;
  return {
    page: (
      <OrganizationProfileAccessPanelView
        controller={controller}
        title={contentTitle}
      />
    ),
    layout: {
      contentTitle,
      contentBackAction: editing || directory ? <AccessBackAction controller={controller} /> : undefined,
      contentFooter: editing || directory ? <AccessFooter controller={controller} /> : undefined,
    },
  };
}
