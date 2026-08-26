import { describe, expectTypeOf, it } from 'vitest';

import type { ClerkJWTClaims, JWTClaims } from '../jwt';
import type { Jwt, JwtPayload } from '../jwtv2';

describe('JwtPayload aud claim', () => {
  it('is an optional RFC 7519 string or string array', () => {
    expectTypeOf<JwtPayload['aud']>().toEqualTypeOf<string | string[] | undefined>();
  });

  it('allows omitting the claim', () => {
    expectTypeOf<undefined>().toExtend<JwtPayload['aud']>();
  });

  it('allows a string resource audience', () => {
    expectTypeOf<string>().toExtend<JwtPayload['aud']>();
  });

  it('allows a string-array audience', () => {
    expectTypeOf<string[]>().toExtend<JwtPayload['aud']>();
  });

  it('is exposed on decodeJwt payload via Jwt', () => {
    expectTypeOf<Jwt['payload']['aud']>().toEqualTypeOf<JwtPayload['aud']>();
  });
});

describe('deprecated ClerkJWTClaims aud claim', () => {
  it('stays consistent with JwtPayload', () => {
    expectTypeOf<ClerkJWTClaims['aud']>().toEqualTypeOf<JwtPayload['aud']>();
    expectTypeOf<JWTClaims['aud']>().toEqualTypeOf<JwtPayload['aud']>();
  });

  it('allows omitting the claim', () => {
    expectTypeOf<undefined>().toExtend<ClerkJWTClaims['aud']>();
  });

  it('allows a string resource audience', () => {
    expectTypeOf<string>().toExtend<ClerkJWTClaims['aud']>();
  });

  it('allows a string-array audience', () => {
    expectTypeOf<string[]>().toExtend<ClerkJWTClaims['aud']>();
  });
});
