import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('MachineTokenAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
  });

  const m2mId = 'mt_xxxxx';
  const m2mSecret = 'mt_secret_xxxxx';

  const mockM2MToken = {
    object: 'machine_to_machine_token',
    id: m2mId,
    subject: 'mch_xxxxx',
    scopes: [],
    secret: m2mSecret,
    revoked: false,
    revocationReason: null,
    expired: false,
    expiration: 1753746916590,
    createdAt: 1753743316590,
    updatedAt: 1753743316590,
  };

  it('creates a machine-to-machine token', async () => {
    const createParams = {
      machineSecret: 'ak_xxxxx',
      secondsUntilExpiration: 3600,
    };

    server.use(
      http.get(
        `https://api.clerk.test/m2m_tokens`,
        validateHeaders(() => {
          return HttpResponse.json(mockM2MToken);
        }),
      ),
    );

    const response = await apiClient.machineTokens.create(createParams);

    expect(response.id).toBe(m2mId);
    expect(response.secret).toBe(m2mSecret);
  });

  it('revokes a machine-to-machine token', async () => {
    const revokeParams = {
      machineSecret: 'ak_xxxxx',
      m2mTokenId: m2mId,
    };

    server.use(
      http.post(`https://api.clerk.test/m2m_tokens/${m2mId}/revoke`, () => {
        return HttpResponse.json({
          ...mockM2MToken,
          revoked: true,
          revocationReason: 'revoked by test',
        });
      }),
    );

    const response = await apiClient.machineTokens.revoke(revokeParams);

    expect(response.revoked).toBe(true);
    expect(response.revocationReason).toBe('revoked by test');
  });

  it('verifies a machine-to-machine token', async () => {
    const verifyParams = {
      machineSecret: 'ak_xxxxx',
      m2mTokenId: m2mId,
      secret: m2mSecret,
    };

    server.use(
      http.post('https://api.clerk.test/m2m_tokens/verify', () => {
        return HttpResponse.json(mockM2MToken);
      }),
    );

    const response = await apiClient.machineTokens.verifySecret(verifyParams);

    expect(response.id).toBe(m2mId);
    expect(response.secret).toBe(m2mSecret);
  });
});
