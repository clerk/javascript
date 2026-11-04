import { describe, expect, it } from 'vitest';

import { mockJwt } from '@/test/core-fixtures';

import { createClientFromJwt } from '../jwt-client';

const jwtWithClaims = (claims: Record<string, unknown>) => {
  const [header, payload, signature] = mockJwt.split('.');
  const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  const encoded = btoa(JSON.stringify({ ...decoded, ...claims }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${encoded}.${signature}`;
};

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

  it('exposes the agent on the stub session when the JWT has an agt claim', () => {
    const client = createClientFromJwt(jwtWithClaims({ agt: { id: 'agent_123', tsk: 'agttsk_456', reg: 'r' } }));

    expect(client.signedInSessions[0]?.agent).toEqual({ sub: 'agent_123', type: 'agent', task_id: 'agttsk_456' });
  });

  it('keeps the actor on the stub session when the JWT has an act claim', () => {
    const client = createClientFromJwt(jwtWithClaims({ act: { sub: 'user_impersonator' } }));

    expect(client.signedInSessions[0]?.actor).toEqual({ sub: 'user_impersonator' });
    expect(client.signedInSessions[0]?.agent).toBeNull();
  });

  it('leaves actor and agent null when the JWT has neither claim', () => {
    const client = createClientFromJwt(mockJwt);

    expect(client.signedInSessions[0]?.actor).toBeNull();
    expect(client.signedInSessions[0]?.agent).toBeNull();
  });
});
