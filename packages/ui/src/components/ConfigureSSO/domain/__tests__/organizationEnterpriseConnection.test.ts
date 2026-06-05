import type {
  EmailAddressResource,
  EnterpriseConnectionResource,
  SamlAccountConnectionResource,
} from '@clerk/shared/types';
import { describe, expect, it } from 'vitest';

import { OrganizationEnterpriseConnection } from '../organizationEnterpriseConnection';

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

// Builds an aggregate with sensible defaults; each test overrides what it cares
// about.
const aggregate = (overrides: Partial<Parameters<typeof OrganizationEnterpriseConnection.create>[0]> = {}) =>
  OrganizationEnterpriseConnection.create({
    connection: undefined,
    primaryEmail: makeEmail('verified'),
    hasSuccessfulTestRun: false,
    ...overrides,
  });

describe('OrganizationEnterpriseConnection aggregate', () => {
  describe('hasConnection', () => {
    it('undefined connection → false', () => {
      expect(aggregate({ connection: undefined }).hasConnection).toBe(false);
    });
    it('null connection → false', () => {
      expect(aggregate({ connection: null }).hasConnection).toBe(false);
    });
    it('connection present → true', () => {
      expect(aggregate({ connection: makeConnection() }).hasConnection).toBe(true);
    });
  });

  describe('provider', () => {
    it('undefined connection → undefined', () => {
      expect(aggregate({ connection: undefined }).provider).toBeUndefined();
    });
    it('connection → its provider', () => {
      expect(aggregate({ connection: makeConnection({ provider: 'saml_custom' }) }).provider).toBe('saml_custom');
    });
  });

  describe('isActive', () => {
    it('undefined connection → false', () => {
      expect(aggregate({ connection: undefined }).isActive()).toBe(false);
    });
    it('null connection → false', () => {
      expect(aggregate({ connection: null }).isActive()).toBe(false);
    });
    it('inactive connection → false', () => {
      expect(aggregate({ connection: makeConnection({ active: false }) }).isActive()).toBe(false);
    });
    it('active connection → true', () => {
      expect(aggregate({ connection: makeConnection({ active: true }) }).isActive()).toBe(true);
    });
  });

  describe('hasMinimumConfiguration', () => {
    it('undefined connection → false', () => {
      expect(aggregate({ connection: undefined }).hasMinimumConfiguration()).toBe(false);
    });
    it('no saml config → false', () => {
      expect(aggregate({ connection: makeConnection({ samlConnection: null }) }).hasMinimumConfiguration()).toBe(false);
    });
    it('empty saml config → false', () => {
      expect(
        aggregate({ connection: makeConnection({ samlConnection: makeSamlConnection() }) }).hasMinimumConfiguration(),
      ).toBe(false);
    });
    it('saml idpSsoUrl + idpEntityId present → true', () => {
      expect(
        aggregate({ connection: makeConnection({ samlConnection: fullyConfiguredSaml }) }).hasMinimumConfiguration(),
      ).toBe(true);
    });
    it('saml idpSsoUrl only → false', () => {
      expect(
        aggregate({
          connection: makeConnection({
            samlConnection: makeSamlConnection({ idpSsoUrl: 'https://idp.example.com/sso' }),
          }),
        }).hasMinimumConfiguration(),
      ).toBe(false);
    });
  });

  describe('isPrimaryEmailVerified', () => {
    it('undefined email → false', () => {
      expect(aggregate({ primaryEmail: undefined }).isPrimaryEmailVerified()).toBe(false);
    });
    it('null email → false', () => {
      expect(aggregate({ primaryEmail: null }).isPrimaryEmailVerified()).toBe(false);
    });
    it('unverified email → false', () => {
      expect(aggregate({ primaryEmail: makeEmail('unverified') }).isPrimaryEmailVerified()).toBe(false);
    });
    it('verified email → true', () => {
      expect(aggregate({ primaryEmail: makeEmail('verified') }).isPrimaryEmailVerified()).toBe(true);
    });
  });

  describe('hasSuccessfulTestRun', () => {
    it('false input → false', () => {
      expect(aggregate({ hasSuccessfulTestRun: false }).hasSuccessfulTestRun()).toBe(false);
    });
    it('true input → true', () => {
      expect(aggregate({ hasSuccessfulTestRun: true }).hasSuccessfulTestRun()).toBe(true);
    });
  });

  it('returns a frozen object', () => {
    expect(Object.isFrozen(aggregate())).toBe(true);
  });
});
