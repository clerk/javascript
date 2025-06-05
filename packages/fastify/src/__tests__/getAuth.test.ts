import type { FastifyRequest } from 'fastify';

import { getAuth } from '../getAuth';

describe('getAuth(req)', () => {
  test('returns req.auth', () => {
    const req = { key1: 'asa', auth: { tokenType: 'session_token' } } as any as FastifyRequest;

    expect(getAuth(req)).toEqual({ tokenType: 'session_token' });
  });

  test('throws error if clerkPlugin is on registered', () => {
    const req = { key1: 'asa' } as any as FastifyRequest;

    expect(() => getAuth(req)).toThrowErrorMatchingSnapshot();
  });
});
