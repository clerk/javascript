import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockJwks, mockRsaJwkKid, signingJwks } from '../../fixtures';
import { signJwt } from '../../jwt/signJwt';
import { server, validateHeaders } from '../../mock-server';
import { verifyHandshakeToken } from '../handshake';
import {
  JWT_CATEGORY_IGNORE,
  JWT_CATEGORY_JWT_TEMPLATE,
  JWT_CATEGORY_M2M_TOKEN,
  JWT_CATEGORY_SESSION_TOKEN,
} from '../jwtCategories';

const directives = ['__session=foo; Path=/'];

async function createHandshakeJwt(cat: string | undefined, handshake = directives) {
  const { data } = await signJwt({ handshake }, signingJwks, {
    algorithm: 'RS256',
    header: { typ: 'JWT', kid: mockRsaJwkKid, ...(cat !== undefined ? { cat } : {}) },
  });
  return data!;
}

function verify(token: string) {
  return verifyHandshakeToken(token, {
    apiUrl: 'https://api.clerk.test',
    secretKey: 'a-valid-key',
    skipJwksCache: true,
  });
}

describe('tokens.verifyHandshakeToken(token, options)', () => {
  beforeEach(() => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/jwks',
        validateHeaders(() => HttpResponse.json(mockJwks)),
      ),
    );
  });

  it.each([
    ['the session-token category, which is what the handshake minter stamps', JWT_CATEGORY_SESSION_TOKEN],
    ['the ignore category, used by instances that opt out of category tagging', JWT_CATEGORY_IGNORE],
    ['no category, for tokens minted before the category rollout', undefined],
  ])('verifies a handshake token with %s', async (_label, cat) => {
    await expect(verify(await createHandshakeJwt(cat))).resolves.toMatchObject({ handshake: directives });
  });

  // Regression test for AISEC-85. A JWT template is the one customer-authorable producer of a
  // token carrying a top-level `handshake[]` claim, and resolveHandshake emits those entries
  // verbatim as Set-Cookie.
  it('rejects a JWT-template token presented as a handshake token', async () => {
    const token = await createHandshakeJwt(JWT_CATEGORY_JWT_TEMPLATE, ['ATTACKER_INJECTED=pwned; Path=/']);

    await expect(verify(token)).rejects.toThrowError('Invalid handshake token category.');
  });

  it.each([
    ['m2m', JWT_CATEGORY_M2M_TOKEN],
    ['unknown', 'cl_some_future_unknown_cat'],
  ])('rejects a handshake token with a %s category', async (_label, cat) => {
    await expect(verify(await createHandshakeJwt(cat))).rejects.toThrowError('Invalid handshake token category.');
  });
});
