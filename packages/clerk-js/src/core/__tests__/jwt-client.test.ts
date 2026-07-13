import { describe, expect, it } from 'vitest';

import { mockJwt } from '@/test/core-fixtures';

import { createClientFromJwt } from '../jwt-client';

describe('createClientFromJwt', () => {
  it('creates a client with a session and user derived from the JWT claims', () => {
    const client = createClientFromJwt(mockJwt);

    expect(client.lastActiveSessionId).toBe('sess_2GbDB4enNdCa5vS1zpC3Xzg9tK9');
    expect(client.signedInSessions[0]?.id).toBe('sess_2GbDB4enNdCa5vS1zpC3Xzg9tK9');
    expect(client.signedInSessions[0]?.user?.id).toBe('user_2GIpXOEpVyJw51rkZn9Kmnc6Sxr');
  });

  it('stamps the stub user with an ancient updatedAt so the real user always replaces it in memoized listeners', () => {
    const client = createClientFromJwt(mockJwt);

    expect(client.signedInSessions[0]?.user?.updatedAt?.getTime()).toBe(1);
  });

  it('returns an empty client when the JWT is missing', () => {
    const client = createClientFromJwt(undefined);

    expect(client.signedInSessions).toEqual([]);
    expect(client.lastActiveSessionId).toBeNull();
  });
});
