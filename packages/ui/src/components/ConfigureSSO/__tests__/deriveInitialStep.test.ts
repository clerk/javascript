import type { EnterpriseConnectionResource } from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { deriveInitialStep } from '../deriveInitialStep';
import type { WizardStepId } from '../types';

const makeConnection = (overrides: Partial<EnterpriseConnectionResource> = {}): EnterpriseConnectionResource =>
  ({
    id: 'enc_1',
    name: 'acme.com',
    active: false,
    provider: 'saml_okta',
    logoPublicUrl: null,
    domains: ['acme.com'],
    organizationId: null,
    syncUserAttributes: false,
    disableAdditionalIdentifications: false,
    allowOrganizationAccountLinking: false,
    customAttributes: [],
    oauthConfig: null,
    samlConnection: null,
    createdAt: null,
    updatedAt: null,
    __internal_toSnapshot: () => ({}) as any,
    ...overrides,
  }) as EnterpriseConnectionResource;

describe('deriveInitialStep', () => {
  const cases: Array<{ name: string; input: EnterpriseConnectionResource | undefined; expected: WizardStepId }> = [
    {
      name: 'no connection → select-provider',
      input: undefined,
      expected: 'select-provider',
    },
    {
      name: 'connection without samlConnection → configure',
      input: makeConnection({ samlConnection: null }),
      expected: 'configure',
    },
    {
      name: 'connection with empty samlConnection.idpSsoUrl → configure',
      input: makeConnection({
        samlConnection: {
          id: 'saml_1',
          name: 'acme.com',
          active: false,
          idpEntityId: '',
          idpSsoUrl: '',
          idpCertificate: '',
          idpMetadataUrl: '',
          idpMetadata: '',
          acsUrl: 'https://clerk.example.com/acs',
          spEntityId: 'https://clerk.example.com',
          spMetadataUrl: 'https://clerk.example.com/sp-metadata',
          allowSubdomains: false,
          allowIdpInitiated: false,
          forceAuthn: false,
        },
      }),
      expected: 'configure',
    },
    {
      name: 'connection with samlConnection.idpSsoUrl populated → confirmation',
      input: makeConnection({
        samlConnection: {
          id: 'saml_1',
          name: 'acme.com',
          active: true,
          idpEntityId: 'https://idp.example.com/entity',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          idpMetadataUrl: 'https://idp.example.com/metadata',
          idpMetadata: '',
          acsUrl: 'https://clerk.example.com/acs',
          spEntityId: 'https://clerk.example.com',
          spMetadataUrl: 'https://clerk.example.com/sp-metadata',
          allowSubdomains: false,
          allowIdpInitiated: false,
          forceAuthn: false,
        },
      }),
      expected: 'confirmation',
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    expect(deriveInitialStep(input)).toBe(expected);
  });
});
