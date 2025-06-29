import { describe, expect, it } from 'vitest';

import { SamlAccount } from '../SamlAccount';

describe('SamlAccount', () => {
  it('has the same initial properties', () => {
    const samlAccount = new SamlAccount({
      object: 'saml_account',
      id: 'saml_123',
      provider: 'saml_okta',
      provider_user_id: 'okta_user_123',
      active: true,
      email_address: 'user@company.com',
      first_name: 'John',
      last_name: 'Doe',
      provider_session_id: 'session_abc123',
      provider_subject: 'subject_xyz789',
      public_metadata: {
        department: 'engineering',
        role: 'senior',
      },
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'saml',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    expect(samlAccount).toMatchObject({
      id: 'saml_123',
      provider: 'saml_okta',
      providerUserId: 'okta_user_123',
      active: true,
      emailAddress: 'user@company.com',
      firstName: 'John',
      lastName: 'Doe',
      verification: expect.any(Object),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});

describe('SamlAccount Snapshots', () => {
  it('should match snapshot for SAML account structure', () => {
    const samlAccount = new SamlAccount({
      object: 'saml_account',
      id: 'saml_123',
      provider: 'saml_okta',
      provider_user_id: 'okta_user_456',
      active: true,
      email_address: 'employee@acme.com',
      first_name: 'Jane',
      last_name: 'Smith',
      provider_session_id: 'okta_session_789',
      provider_subject: 'okta_subject_abc',
      public_metadata: {
        department: 'marketing',
        team: 'growth',
      },
      verification: {
        object: 'verification',
        id: 'verification_123',
        status: 'verified',
        strategy: 'saml',
        attempts: 1,
        expire_at: 1735689700000,
        verified_at_client: null,
        error: null,
      },
      created_at: 1735689500000,
      updated_at: 1735689650000,
    });

    const snapshot = {
      id: samlAccount.id,
      provider: samlAccount.provider,
      providerUserId: samlAccount.providerUserId,
      active: samlAccount.active,
      emailAddress: samlAccount.emailAddress,
      firstName: samlAccount.firstName,
      lastName: samlAccount.lastName,
      publicMetadata: samlAccount.publicMetadata,
      verification: {
        id: samlAccount.verification?.id,
        status: samlAccount.verification?.status,
        strategy: samlAccount.verification?.strategy,
      },
      createdAt: samlAccount.createdAt?.getTime(),
      updatedAt: samlAccount.updatedAt?.getTime(),
    };

    expect(snapshot).toMatchSnapshot();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    const samlAccount = new SamlAccount({
      object: 'saml_account',
      id: 'saml_456',
      provider: 'saml_azure',
      provider_user_id: 'azure_user_789',
      active: false,
      email_address: 'contractor@external.com',
      first_name: 'Bob',
      last_name: 'Johnson',
      provider_session_id: null,
      provider_subject: 'azure_subject_def',
      public_metadata: {},
      verification: {
        object: 'verification',
        id: 'verification_456',
        status: 'unverified',
        strategy: 'saml',
        attempts: 0,
        expire_at: 1735689800000,
        verified_at_client: null,
        error: null,
      },
      created_at: 1735689500000,
      updated_at: 1735689500000,
    });

    if (typeof samlAccount.__internal_toSnapshot === 'function') {
      const snapshot = samlAccount.__internal_toSnapshot();
      expect(snapshot).toMatchSnapshot();
    }
  });
});
