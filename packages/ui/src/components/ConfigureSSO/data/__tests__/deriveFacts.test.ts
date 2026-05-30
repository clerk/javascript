import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  OrganizationResource,
  SamlAccountConnectionResource,
  SignedInSessionResource,
  UserResource,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { deriveFacts, type WizardFacts } from '../deriveFacts';

const makeEmail = (overrides: Partial<EmailAddressResource> = {}): EmailAddressResource =>
  ({
    id: 'idn_1',
    emailAddress: 'user@acme.com',
    verification: { status: 'verified' },
    ...overrides,
  }) as EmailAddressResource;

const makeUser = (overrides: Partial<UserResource> = {}): UserResource =>
  ({
    id: 'user_1',
    primaryEmailAddress: makeEmail(),
    emailAddresses: [makeEmail()],
    ...overrides,
  }) as UserResource;

const makeSession = (overrides: Partial<SignedInSessionResource> = {}): SignedInSessionResource =>
  ({
    id: 'sess_1',
    lastActiveOrganizationId: 'org_1',
    ...overrides,
  }) as SignedInSessionResource;

const makeSamlConnection = (overrides: Partial<SamlAccountConnectionResource> = {}): SamlAccountConnectionResource =>
  ({
    id: 'saml_1',
    idpEntityId: '',
    idpSsoUrl: '',
    idpCertificate: '',
    idpMetadataUrl: '',
    ...overrides,
  }) as SamlAccountConnectionResource;

const makeConnection = (overrides: Partial<EnterpriseConnectionResource> = {}): EnterpriseConnectionResource =>
  ({
    id: 'enc_1',
    name: 'acme.com',
    active: false,
    provider: 'saml_okta',
    organizationId: 'org_1',
    samlConnection: null,
    ...overrides,
  }) as EnterpriseConnectionResource;

const fullyConfiguredSaml = makeSamlConnection({
  idpEntityId: 'https://idp.example.com/entity',
  idpSsoUrl: 'https://idp.example.com/sso',
  idpCertificate: 'CERT',
  idpMetadataUrl: 'https://idp.example.com/metadata',
});

const organization = { id: 'org_1', name: 'Acme' } as OrganizationResource;

type Input = Parameters<typeof deriveFacts>[0];

const baseInput: Input = {
  user: makeUser(),
  session: makeSession(),
  connection: undefined,
  hasSuccessfulTestRun: false,
  organization,
};

describe('deriveFacts', () => {
  const cases: Array<{
    name: string;
    input: Input;
    expected: WizardFacts;
  }> = [
    {
      name: 'no connection',
      input: { ...baseInput, connection: undefined },
      expected: {
        hasConnection: false,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: undefined,
      },
    },
    {
      name: 'connection belonging to the active org',
      input: { ...baseInput, connection: makeConnection({ organizationId: 'org_1' }) },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'verified email + connection owned by another org → domain taken',
      input: { ...baseInput, connection: makeConnection({ organizationId: 'org_other' }) },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: true,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'unverified email → domain never counts as taken',
      input: {
        ...baseInput,
        user: makeUser({
          primaryEmailAddress: null,
          emailAddresses: [
            makeEmail({ verification: { status: 'unverified' } as EmailAddressResource['verification'] }),
          ],
        }),
        connection: makeConnection({ organizationId: 'org_other' }),
      },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: false,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'connection with empty SAML config → no minimum IdP config',
      input: { ...baseInput, connection: makeConnection({ samlConnection: makeSamlConnection() }) },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'connection with SAML idpSsoUrl + idpEntityId → minimum IdP config',
      input: { ...baseInput, connection: makeConnection({ samlConnection: fullyConfiguredSaml }) },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: true,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'configured connection with successful test run',
      input: {
        ...baseInput,
        connection: makeConnection({ samlConnection: fullyConfiguredSaml }),
        hasSuccessfulTestRun: true,
      },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: true,
        hasSuccessfulTestRun: true,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
    {
      name: 'active connection',
      input: {
        ...baseInput,
        connection: makeConnection({ active: true, provider: 'saml_custom', samlConnection: fullyConfiguredSaml }),
      },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: true,
        hasSuccessfulTestRun: false,
        isConnectionActive: true,
        provider: 'saml_custom',
      },
    },
    {
      name: 'no active org in session + connection with null org → not taken',
      input: {
        ...baseInput,
        session: makeSession({ lastActiveOrganizationId: null }),
        connection: makeConnection({ organizationId: null }),
      },
      expected: {
        hasConnection: true,
        isPrimaryEmailVerified: true,
        isDomainTakenByOtherOrg: false,
        hasMinimumIdPConfig: false,
        hasSuccessfulTestRun: false,
        isConnectionActive: false,
        provider: 'saml_okta',
      },
    },
  ];

  it.each(cases)('$name', ({ input, expected }) => {
    expect(deriveFacts(input)).toEqual(expected);
  });
});
