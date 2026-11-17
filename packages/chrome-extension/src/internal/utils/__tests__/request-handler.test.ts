import { describe, expect, it, vi } from 'vitest';

import type { JWTHandler } from '../jwt-handler';
import { requestHandler } from '../request-handler';

describe('requestHandler', () => {
  it.each([
    { isProd: true, jwt: undefined },
    { isProd: true, jwt: 'client-jwt' },
    { isProd: false, jwt: undefined },
    { isProd: false, jwt: 'development-jwt' },
  ])('sets request credentials for isProd=$isProd and jwt=$jwt', async ({ isProd, jwt }) => {
    const jwtHandler: JWTHandler = {
      get: vi.fn().mockResolvedValue(jwt),
      set: vi.fn(),
      remove: vi.fn(),
      listener: vi.fn(),
    };
    const request = {
      url: new URL('https://example.com/v1/client'),
      headers: new Headers(),
      credentials: 'include' as RequestCredentials,
    };

    await requestHandler(jwtHandler, { isProd })(request);

    expect(request.credentials).toBe('omit');
    expect(request.url.searchParams.getAll('_is_native')).toEqual(isProd ? ['1'] : []);
    expect(request.url.searchParams.get('__clerk_db_jwt')).toBe(!isProd && jwt ? jwt : null);
    expect(request.headers.get('Authorization')).toBe(isProd && jwt ? `Bearer ${jwt}` : null);
  });
});
