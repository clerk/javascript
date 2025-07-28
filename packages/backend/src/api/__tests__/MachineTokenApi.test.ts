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
    revocation_reason: null,
    expired: false,
    expiration: 1753746916590,
    created_at: 1753743316590,
    updated_at: 1753743316590,
  };

  it('creates a machine-to-machine token', async () => {
    const createParams = {
      machineSecret: 'ak_xxxxx',
      secondsUntilExpiration: 3600,
    };

    server.use(
      http.post(
        'https://api.clerk.test/m2m_tokens',
        validateHeaders(({ request }) => {
          expect(request.headers.get('Authorization')).toBe('Bearer ak_xxxxx');
          return HttpResponse.json(mockM2MToken);
        }),
      ),
    );

    const response = await apiClient.machineTokens.create(createParams);

    expect(response.id).toBe(m2mId);
    expect(response.secret).toBe(m2mSecret);
  });

  it('handles missing machine secret', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/m2m_tokens`,
        validateHeaders(() => {
          return HttpResponse.json(mockM2MToken);
        }),
      ),
    );

    // @ts-expect-error - machineSecret is required
    const response = await apiClient.machineTokens.create({}).catch(err => err);

    expect(response.message).toBe('A machine secret is required.');
  });

  it('revokes a machine-to-machine token', async () => {
    const revokeParams = {
      machineSecret: 'ak_xxxxx',
      m2mTokenId: m2mId,
      revocationReason: 'revoked by test',
    };

    const mockRevokedM2MToken = {
      object: 'machine_to_machine_token',
      id: m2mId,
      subject: 'mch_xxxxx',
      scopes: [],
      revoked: true,
      revocation_reason: 'revoked by test',
      expired: false,
      expiration: 1753746916590,
      created_at: 1753743316590,
      updated_at: 1753743316590,
    };

    server.use(
      http.post(`https://api.clerk.test/m2m_tokens/${m2mId}/revoke`, () => {
        return HttpResponse.json(mockRevokedM2MToken);
      }),
    );

    const response = await apiClient.machineTokens.revoke(revokeParams);

    expect(response.revoked).toBe(true);
    expect(response.secret).toBeUndefined();
    expect(response.revocationReason).toBe('revoked by test');
  });

  it('verifies a machine-to-machine token', async () => {
    const verifyParams = {
      machineSecret: 'ak_xxxxx',
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
