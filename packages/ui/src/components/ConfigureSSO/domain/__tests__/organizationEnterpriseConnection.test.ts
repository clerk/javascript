import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  SamlAccountConnectionResource,
  UserResource,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import {
  connectionBackingEmail,
  isEnterpriseConnectionConfigured,
  organizationEnterpriseConnection,
} from '../organizationEnterpriseConnection';

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

const makeEmail = (status: 'verified' | 'unverified' | null): EmailAddressResource =>
  ({
    id: 'idn_1',
    emailAddress: 'admin@acme.com',
    verification: { status },
  }) as EmailAddressResource;

const fullyConfiguredSaml = makeSamlConnection({
  idpEntityId: 'https://idp.example.com/entity',
  idpSsoUrl: 'https://idp.example.com/sso',
  idpCertificate: 'CERT',
  idpMetadataUrl: 'https://idp.example.com/metadata',
});

// Builds the entity with sensible defaults; each test overrides what it cares
// about.
const derive = (overrides: Partial<Parameters<typeof organizationEnterpriseConnection>[0]> = {}) =>
  organizationEnterpriseConnection({
    connection: undefined,
    primaryEmail: makeEmail('verified'),
    hasSuccessfulTestRun: false,
    ...overrides,
  });

describe('organizationEnterpriseConnection', () => {
  describe('hasConnection', () => {
    it('undefined connection → false', () => {
      expect(derive({ connection: undefined }).hasConnection).toBe(false);
    });
    it('null connection → false', () => {
      expect(derive({ connection: null }).hasConnection).toBe(false);
    });
    it('connection present → true', () => {
      expect(derive({ connection: makeConnection() }).hasConnection).toBe(true);
    });
  });

  describe('provider', () => {
    it('undefined connection → undefined', () => {
      expect(derive({ connection: undefined }).provider).toBeUndefined();
    });
    it('connection → its provider', () => {
      expect(derive({ connection: makeConnection({ provider: 'saml_custom' }) }).provider).toBe('saml_custom');
    });
  });

  describe('isActive', () => {
    it('undefined connection → false', () => {
      expect(derive({ connection: undefined }).isActive).toBe(false);
    });
    it('null connection → false', () => {
      expect(derive({ connection: null }).isActive).toBe(false);
    });
    it('inactive connection → false', () => {
      expect(derive({ connection: makeConnection({ active: false }) }).isActive).toBe(false);
    });
    it('active connection → true', () => {
      expect(derive({ connection: makeConnection({ active: true }) }).isActive).toBe(true);
    });
  });

  describe('hasMinimumConfiguration', () => {
    it('undefined connection → false', () => {
      expect(derive({ connection: undefined }).hasMinimumConfiguration).toBe(false);
    });
    it('no saml config → false', () => {
      expect(derive({ connection: makeConnection({ samlConnection: null }) }).hasMinimumConfiguration).toBe(false);
    });
    it('empty saml config → false', () => {
      expect(
        derive({ connection: makeConnection({ samlConnection: makeSamlConnection() }) }).hasMinimumConfiguration,
      ).toBe(false);
    });
    it('saml idpSsoUrl + idpEntityId present → true', () => {
      expect(
        derive({ connection: makeConnection({ samlConnection: fullyConfiguredSaml }) }).hasMinimumConfiguration,
      ).toBe(true);
    });
    it('saml idpSsoUrl only → false', () => {
      expect(
        derive({
          connection: makeConnection({
            samlConnection: makeSamlConnection({ idpSsoUrl: 'https://idp.example.com/sso' }),
          }),
        }).hasMinimumConfiguration,
      ).toBe(false);
    });
  });

  describe('isPrimaryEmailVerified', () => {
    it('undefined email → false', () => {
      expect(derive({ primaryEmail: undefined }).isPrimaryEmailVerified).toBe(false);
    });
    it('null email → false', () => {
      expect(derive({ primaryEmail: null }).isPrimaryEmailVerified).toBe(false);
    });
    it('unverified email → false', () => {
      expect(derive({ primaryEmail: makeEmail('unverified') }).isPrimaryEmailVerified).toBe(false);
    });
    it('verified email → true', () => {
      expect(derive({ primaryEmail: makeEmail('verified') }).isPrimaryEmailVerified).toBe(true);
    });
  });

  describe('hasSuccessfulTestRun', () => {
    it('false input → false', () => {
      expect(derive({ hasSuccessfulTestRun: false }).hasSuccessfulTestRun).toBe(false);
    });
    it('true input → true', () => {
      expect(derive({ hasSuccessfulTestRun: true }).hasSuccessfulTestRun).toBe(true);
    });
  });

  describe('status', () => {
    it('undefined connection → unconfigured', () => {
      expect(derive({ connection: undefined }).status).toBe('unconfigured');
    });
    it('null connection → unconfigured', () => {
      expect(derive({ connection: null }).status).toBe('unconfigured');
    });
    it('created but unconfigured connection → in_progress', () => {
      expect(derive({ connection: makeConnection({ samlConnection: null }) }).status).toBe('in_progress');
    });
    it('partially configured connection → in_progress', () => {
      expect(
        derive({
          connection: makeConnection({
            samlConnection: makeSamlConnection({ idpSsoUrl: 'https://idp.example.com/sso' }),
          }),
        }).status,
      ).toBe('in_progress');
    });
    it('configured but not yet successfully tested → in_progress', () => {
      expect(
        derive({
          connection: makeConnection({ samlConnection: fullyConfiguredSaml, active: false }),
          hasSuccessfulTestRun: false,
        }).status,
      ).toBe('in_progress');
    });
    it('successfully tested but not minimally configured → in_progress', () => {
      expect(
        derive({
          connection: makeConnection({ samlConnection: null, active: false }),
          hasSuccessfulTestRun: true,
        }).status,
      ).toBe('in_progress');
    });
    it('configured + successfully tested + not active → inactive', () => {
      expect(
        derive({
          connection: makeConnection({ samlConnection: fullyConfiguredSaml, active: false }),
          hasSuccessfulTestRun: true,
        }).status,
      ).toBe('inactive');
    });
    it('active connection → active', () => {
      expect(derive({ connection: makeConnection({ samlConnection: fullyConfiguredSaml, active: true }) }).status).toBe(
        'active',
      );
    });
    it('active wins over configured + successfully tested', () => {
      expect(
        derive({
          connection: makeConnection({ samlConnection: fullyConfiguredSaml, active: true }),
          hasSuccessfulTestRun: true,
        }).status,
      ).toBe('active');
    });
    it('active wins even for an unconfigured, untested connection', () => {
      expect(
        derive({
          connection: makeConnection({ samlConnection: null, active: true }),
          hasSuccessfulTestRun: false,
        }).status,
      ).toBe('active');
    });
  });

  it('is pure: identical inputs produce a deep-equal entity', () => {
    const connection = makeConnection({ samlConnection: fullyConfiguredSaml, active: true });
    const primaryEmail = makeEmail('verified');
    const inputs = { connection, primaryEmail, hasSuccessfulTestRun: true } as const;

    expect(organizationEnterpriseConnection(inputs)).toEqual(organizationEnterpriseConnection(inputs));
  });

  it('carries the expected field values for a fully configured connection', () => {
    const entity = derive({
      connection: makeConnection({ provider: 'saml_custom', samlConnection: fullyConfiguredSaml, active: true }),
      primaryEmail: makeEmail('verified'),
      hasSuccessfulTestRun: true,
    });

    expect(entity).toEqual({
      provider: 'saml_custom',
      hasConnection: true,
      isActive: true,
      hasMinimumConfiguration: true,
      isPrimaryEmailVerified: true,
      hasSuccessfulTestRun: true,
      status: 'active',
    });
  });
});

describe('isEnterpriseConnectionConfigured', () => {
  it('undefined connection → false', () => {
    expect(isEnterpriseConnectionConfigured(undefined)).toBe(false);
  });
  it('null connection → false', () => {
    expect(isEnterpriseConnectionConfigured(null)).toBe(false);
  });
  it('no saml config → false', () => {
    expect(isEnterpriseConnectionConfigured(makeConnection({ samlConnection: null }))).toBe(false);
  });
  it('empty saml config → false', () => {
    expect(isEnterpriseConnectionConfigured(makeConnection({ samlConnection: makeSamlConnection() }))).toBe(false);
  });
  it('idpSsoUrl only → false', () => {
    expect(
      isEnterpriseConnectionConfigured(
        makeConnection({ samlConnection: makeSamlConnection({ idpSsoUrl: 'https://idp.example.com/sso' }) }),
      ),
    ).toBe(false);
  });
  it('idpSsoUrl + idpEntityId present → true', () => {
    expect(isEnterpriseConnectionConfigured(makeConnection({ samlConnection: fullyConfiguredSaml }))).toBe(true);
  });
  it('matches the derived `hasMinimumConfiguration` field', () => {
    const connection = makeConnection({ samlConnection: fullyConfiguredSaml });
    expect(isEnterpriseConnectionConfigured(connection)).toBe(derive({ connection }).hasMinimumConfiguration);
  });
});

describe('connectionBackingEmail', () => {
  const email = (id: string, status: 'verified' | 'unverified'): EmailAddressResource =>
    ({ id, emailAddress: `${id}@acme.com`, verification: { status } }) as EmailAddressResource;

  const makeUser = (overrides: Partial<UserResource>): UserResource => overrides as UserResource;

  it('returns the primary email when one is present', () => {
    const primary = email('primary', 'verified');
    const unverified = email('other', 'unverified');
    const user = makeUser({ primaryEmailAddress: primary, emailAddresses: [primary, unverified] });
    expect(connectionBackingEmail(user)).toBe(primary);
  });

  it('falls back to the first unverified address when there is no primary', () => {
    const unverified = email('pending', 'unverified');
    const verified = email('done', 'verified');
    const user = makeUser({ primaryEmailAddress: null, emailAddresses: [verified, unverified] });
    expect(connectionBackingEmail(user)).toBe(unverified);
  });

  it('returns undefined when there is no primary and every address is verified', () => {
    const verified = email('done', 'verified');
    const user = makeUser({ primaryEmailAddress: null, emailAddresses: [verified] });
    expect(connectionBackingEmail(user)).toBeUndefined();
  });

  it('returns undefined for a null or undefined user', () => {
    expect(connectionBackingEmail(null)).toBeUndefined();
    expect(connectionBackingEmail(undefined)).toBeUndefined();
  });
});
