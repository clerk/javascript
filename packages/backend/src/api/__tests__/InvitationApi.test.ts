import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('InvitationAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  describe('deleteInvitation', () => {
    const invitationId = 'inv_123';

    it('deletes an invitation by ID', async () => {
      server.use(
        http.delete(
          `https://api.clerk.test/v1/invitations/${invitationId}`,
          validateHeaders(() => HttpResponse.json({ object: 'invitation', id: invitationId, deleted: true })),
        ),
      );

      const response = await apiClient.invitations.deleteInvitation(invitationId);

      expect(response.object).toBe('invitation');
      expect(response.id).toBe(invitationId);
      expect(response.deleted).toBe(true);
    });

    it('throws an error when the invitation ID is missing', async () => {
      await expect(apiClient.invitations.deleteInvitation('')).rejects.toThrow('A valid resource ID is required.');
    });
  });
});
