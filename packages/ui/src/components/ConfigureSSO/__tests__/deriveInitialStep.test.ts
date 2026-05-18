import type { EnterpriseConnectionResource, SamlAccountConnectionResource } from '@clerk/shared/types';
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

const makeSamlConnection = (overrides: Partial<SamlAccountConnectionResource> = {}): SamlAccountConnectionResource =>
  ({
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
    ...overrides,
  }) as SamlAccountConnectionResource;

const defaultOptions = { isDomainTakenByOtherOrg: false, hasSuccessfulTestRun: false };

describe('deriveInitialStep', () => {
  const cases: Array<{
    name: string;
    input: EnterpriseConnectionResource | undefined;
    options?: Partial<typeof defaultOptions>;
    expected: WizardStepId;
  }> = [
    {
      name: 'domain taken by other org → verify-domain',
      input: makeConnection(),
      options: { isDomainTakenByOtherOrg: true },
      expected: 'verify-domain',
    },
    {
      name: 'no connection → select-provider',
      input: undefined,
      expected: 'select-provider',
    },
    {
      name: 'active connection → confirmation',
      input: makeConnection({ active: true, samlConnection: makeSamlConnection() }),
      expected: 'confirmation',
    },
    {
      name: 'connection with empty SAML IdP config → configure',
      input: makeConnection({ samlConnection: makeSamlConnection() }),
      expected: 'configure',
    },
    {
      name: 'configured connection without successful test run → test',
      input: makeConnection({
        samlConnection: makeSamlConnection({
          idpEntityId: 'https://idp.example.com/entity',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          idpMetadataUrl: 'https://idp.example.com/metadata',
        }),
      }),
      expected: 'test',
    },
    {
      name: 'configured connection with successful test run → confirmation',
      input: makeConnection({
        samlConnection: makeSamlConnection({
          idpEntityId: 'https://idp.example.com/entity',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          idpMetadataUrl: 'https://idp.example.com/metadata',
        }),
      }),
      options: { hasSuccessfulTestRun: true },
      expected: 'confirmation',
    },
  ];

  it.each(cases)('$name', ({ input, options, expected }) => {
    expect(deriveInitialStep(input, { ...defaultOptions, ...options })).toBe(expected);
  });
});
