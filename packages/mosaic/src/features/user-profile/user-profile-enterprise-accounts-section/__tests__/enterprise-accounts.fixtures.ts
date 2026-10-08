import type { FakeFapiSeed } from '../../../../__tests__/feature/fake-fapi';
import {
  fapiClient,
  fapiEmailAddress,
  fapiEnterpriseConnection,
  fapiEnvironment,
  fapiMembership,
  fapiOrganization,
  fapiSession,
  fapiUser,
  fapiVerification,
} from '../../../../__tests__/feature/fapi';

export const okta = fapiEnterpriseConnection({ id: 'okta', name: 'Acme Okta', organization_id: 'org_acme' });
export const custom = fapiEnterpriseConnection({ id: 'saml', name: 'Custom SAML', organization_id: 'org_acme' });

export function enterpriseMember(id = 'user_1') {
  return fapiUser({
    id,
    email_addresses: [fapiEmailAddress({ id: `email_${id}`, email_address: `${id}@example.com` })],
    organization_memberships: [fapiMembership(fapiOrganization({ id: 'org_acme', name: 'Acme' }))],
  });
}

export function enterpriseAccountSeed(overrides: FakeFapiSeed = {}): FakeFapiSeed {
  const verification = fapiVerification('saml', {
    status: 'unverified',
    external_verification_redirect_url: 'https://accounts.example/enterprise-authorize',
  });
  return {
    client: fapiClient([fapiSession({ id: 'sess_1', user: enterpriseMember() })]),
    environment: fapiEnvironment({
      user_settings: { enterprise_sso: { enabled: true, self_serve_sso: false, self_serve_directory_sync: false } },
    }),
    enterpriseConnections: [okta, custom],
    enterpriseLinking: {
      enabled: true,
      preparations: { okta: { kind: 'saml', verification }, saml: { kind: 'saml', verification } },
    },
    ...overrides,
  };
}
