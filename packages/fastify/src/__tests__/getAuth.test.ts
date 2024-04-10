import type { FastifyRequest } from 'fastify';

import { getAuth } from '../getAuth';

describe('getAuth(req)', () => {
  test('returns req.auth', () => {
    const req = { key1: 'asa', auth: 'authObj' } as any as FastifyRequest;

    expect(getAuth(req)).toEqual('authObj');
  });

  test('throws error if clerkPlugin is on registered', () => {
    const req = { key1: 'asa' } as any as FastifyRequest;

    expect(() => getAuth(req)).toThrowErrorMatchingSnapshot();
  });
});
