import { http, HttpResponse } from 'msw';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { OrganizationInvitation } from '../resources/OrganizationInvitation';

describe('OrganizationAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const organizationId = 'org_123';

  const mockInvitation = {
    object: 'organization_invitation',
    id: 'orginv_1',
    email_address: 'one@example.com',
    role: 'org:member',
    role_name: 'Member',
    organization_id: organizationId,
    status: 'pending',
    public_metadata: {},
    private_metadata: {},
    url: null,
    created_at: 1640995200,
    updated_at: 1640995200,
    expires_at: 1643673600,
  };

  describe('createOrganizationInvitationBulk', () => {
    it('returns a paginated { data, totalCount } response matching the Backend API shape', async () => {
      server.use(
        http.post(
          `https://api.clerk.test/v1/organizations/${organizationId}/invitations/bulk`,
          validateHeaders(async ({ request }) => {
            // The SDK should forward the invitations as a snake_cased array body.
            const body = (await request.json()) as Array<Record<string, unknown>>;
            expect(body).toHaveLength(2);
            expect(body[0]).toMatchObject({
              email_address: 'one@example.com',
              role: 'org:member',
              inviter_user_id: 'user_1',
            });

            return HttpResponse.json({
              data: [mockInvitation, { ...mockInvitation, id: 'orginv_2', email_address: 'two@example.com' }],
              total_count: 2,
            });
          }),
        ),
      );

      const response = await apiClient.organizations.createOrganizationInvitationBulk(organizationId, [
        { emailAddress: 'one@example.com', role: 'org:member', inviterUserId: 'user_1' },
        { emailAddress: 'two@example.com', role: 'org:member', inviterUserId: 'user_1' },
      ]);

      // The Backend API wraps bulk results in a paginated envelope, and the
      // deserializer surfaces it as `{ data, totalCount }`.
      expect(response.data).toHaveLength(2);
      expect(response.data[0].emailAddress).toBe('one@example.com');
      expect(response.data[0].organizationId).toBe(organizationId);
      expect(response.totalCount).toBe(2);

      // The declared return type must reflect that paginated shape, the same
      // way the sibling `getOrganizationInvitationList` does.
      expectTypeOf(response).toEqualTypeOf<PaginatedResourceResponse<OrganizationInvitation[]>>();
    });
  });
});
