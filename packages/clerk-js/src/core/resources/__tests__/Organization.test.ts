import type { EnterpriseConnectionJSON, OrganizationJSON } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { BaseResource, Organization } from '../internal';

const ORG_ID = 'org_123';

function createOrganization(): Organization {
  return new Organization({
    object: 'organization',
    id: ORG_ID,
    name: 'Acme Corp',
    slug: 'acme',
    image_url: '',
    has_image: false,
    public_metadata: {},
    members_count: 1,
    pending_invitations_count: 0,
    max_allowed_memberships: 5,
    admin_delete_enabled: true,
    self_serve_sso_enabled: true,
    created_at: 1,
    updated_at: 2,
  } as unknown as OrganizationJSON);
}

describe('Organization', () => {
  it('has the same initial properties', () => {
    const organization = new Organization({
      object: 'organization',
      id: 'test_id',
      name: 'test_name',
      public_metadata: { public: 'metadata' },
      slug: 'test_slug',
      image_url:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
      created_at: 12345,
      updated_at: 5678,
      members_count: 1,
      pending_invitations_count: 10,
      admin_delete_enabled: true,
      max_allowed_memberships: 3,
      has_image: true,
      self_serve_sso_enabled: true,
    });

    expect(organization).toMatchObject({
      id: 'test_id',
      name: 'test_name',
      slug: 'test_slug',
      hasImage: true,
      imageUrl:
        'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18xbHlXRFppb2JyNjAwQUtVZVFEb1NsckVtb00iLCJyaWQiOiJ1c2VyXzJKbElJQTN2VXNjWXh1N2VUMnhINmFrTGgxOCIsImluaXRpYWxzIjoiREsifQ?width=160',
      membersCount: 1,
      pendingInvitationsCount: 10,
      maxAllowedMemberships: 3,
      adminDeleteEnabled: true,
      selfServeSSOEnabled: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      publicMetadata: {
        public: 'metadata',
      },
    });
  });

  describe('enterprise connections', () => {
    it('fetches enterprise connections from the org-scoped path', async () => {
      const enterpriseConnectionsJSON: EnterpriseConnectionJSON[] = [
        {
          id: 'ec_123',
          object: 'enterprise_connection',
          name: 'Acme Corp SSO',
          active: true,
          allow_organization_account_linking: true,
          provider: 'saml_okta',
          logo_public_url: null,
          domains: ['acme.com'],
          organization_id: ORG_ID,
          sync_user_attributes: true,
          disable_additional_identifications: false,
          custom_attributes: [],
          oauth_config: null,
          saml_connection: {
            id: 'saml_123',
            name: 'Acme Corp SSO',
            active: true,
            idp_entity_id: 'https://idp.acme.com/entity',
            idp_sso_url: 'https://idp.acme.com/sso',
            idp_certificate: 'MIICertificatePlaceholder',
            idp_metadata_url: 'https://idp.acme.com/metadata',
            idp_metadata: '',
            acs_url: 'https://clerk.example.com/v1/saml/acs',
            sp_entity_id: 'https://clerk.example.com',
            sp_metadata_url: 'https://clerk.example.com/v1/saml/metadata',
            allow_subdomains: false,
            allow_idp_initiated: false,
            force_authn: false,
          },
          created_at: 1234567890,
          updated_at: 1234567890,
        },
      ];

      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionsJSON }));

      const organization = createOrganization();

      const connections = await organization.getEnterpriseConnections();

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'GET',
        path: `/organizations/${ORG_ID}/enterprise_connections`,
      });

      expect(connections).toHaveLength(1);
      expect(connections[0].name).toBe('Acme Corp SSO');
      expect(connections[0].allowOrganizationAccountLinking).toBe(true);
    });

    it('creates an enterprise connection without forwarding organization_id in the body', async () => {
      const enterpriseConnectionJSON = {
        id: 'ec_new',
        object: 'enterprise_connection' as const,
        name: 'New SSO',
        active: true,
        provider: 'saml_okta',
        logo_public_url: null,
        domains: [],
        organization_id: ORG_ID,
        sync_user_attributes: true,
        disable_additional_identifications: false,
        allow_organization_account_linking: false,
        custom_attributes: [],
        oauth_config: null,
        saml_connection: null,
        created_at: 1234567890,
        updated_at: 1234567890,
      };

      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionJSON }));

      const organization = createOrganization();

      const conn = await organization.createEnterpriseConnection({
        provider: 'saml_okta',
        name: 'New SSO',
        // Even though callers may still pass this for convenience, the SDK
        // must not include it in the body — the org URL is authoritative.
        organizationId: ORG_ID,
        saml: { idpEntityId: 'https://idp.example.com' },
      });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'POST',
        path: `/organizations/${ORG_ID}/enterprise_connections`,
        body: {
          provider: 'saml_okta',
          name: 'New SSO',
          saml_idp_entity_id: 'https://idp.example.com',
        },
      });

      // @ts-ignore
      const callBody = BaseResource._fetch.mock.calls[0][0].body;
      expect(callBody.organization_id).toBeUndefined();

      expect(conn.id).toBe('ec_new');
      expect(conn.name).toBe('New SSO');
    });

    it('updates an enterprise connection without forwarding organization_id in the body', async () => {
      const enterpriseConnectionJSON = {
        id: 'ec_123',
        object: 'enterprise_connection' as const,
        name: 'Updated',
        active: false,
        provider: 'saml_okta',
        logo_public_url: null,
        domains: [],
        organization_id: ORG_ID,
        sync_user_attributes: true,
        disable_additional_identifications: false,
        allow_organization_account_linking: false,
        custom_attributes: [],
        oauth_config: null,
        saml_connection: null,
        created_at: 1234567890,
        updated_at: 1234567900,
      };

      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: enterpriseConnectionJSON }));

      const organization = createOrganization();

      await organization.updateEnterpriseConnection('ec_123', {
        name: 'Updated',
        active: false,
        syncUserAttributes: true,
        organizationId: ORG_ID,
      });

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'PATCH',
        path: `/organizations/${ORG_ID}/enterprise_connections/ec_123`,
        body: {
          name: 'Updated',
          active: false,
          sync_user_attributes: true,
        },
      });

      // @ts-ignore
      const callBody = BaseResource._fetch.mock.calls[0][0].body;
      expect(callBody.organization_id).toBeUndefined();
    });

    it('deletes an enterprise connection', async () => {
      const deletedJSON = {
        object: 'enterprise_connection',
        id: 'ec_123',
        deleted: true,
      };

      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: deletedJSON }));

      const organization = createOrganization();

      const result = await organization.deleteEnterpriseConnection('ec_123');

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'DELETE',
        path: `/organizations/${ORG_ID}/enterprise_connections/ec_123`,
      });

      expect(result.id).toBe('ec_123');
      expect(result.deleted).toBe(true);
    });

    it('creates an enterprise connection test run', async () => {
      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: { url: 'https://example.com/test' } }));

      const organization = createOrganization();

      const init = await organization.createEnterpriseConnectionTestRun('ec_123');

      // @ts-ignore
      expect(BaseResource._fetch).toHaveBeenCalledWith({
        method: 'POST',
        path: `/organizations/${ORG_ID}/enterprise_connections/ec_123/test_runs`,
      });

      expect(init.url).toBe('https://example.com/test');
    });

    it('lists enterprise connection test runs', async () => {
      const paginated = {
        data: [
          {
            object: 'enterprise_connection_test_run' as const,
            id: 'run_1',
            status: 'success',
            connection_type: 'saml' as const,
            created_at: 1700000000000,
          },
        ],
        total_count: 1,
      };

      // @ts-ignore
      BaseResource._fetch = vi.fn().mockReturnValue(Promise.resolve({ response: paginated }));

      const organization = createOrganization();

      const result = await organization.getEnterpriseConnectionTestRuns('ec_123', {
        initialPage: 1,
        pageSize: 10,
        status: ['pending', 'success'],
      });

      // @ts-ignore
      const call = BaseResource._fetch.mock.calls[0][0];
      expect(call.method).toBe('GET');
      expect(call.path).toBe(`/organizations/${ORG_ID}/enterprise_connections/ec_123/test_runs`);
      expect(call.search.get('limit')).toBe('10');
      expect(call.search.get('offset')).toBe('0');
      expect(call.search.getAll('status')).toEqual(['pending', 'success']);

      expect(result.total_count).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('run_1');
      expect(result.data[0].connectionType).toBe('saml');
    });
  });
});
