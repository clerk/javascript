import { describe, expectTypeOf, it } from 'vitest';

import type { JwtPayload } from '@clerk/shared/types';

import { decodeJwt, verifyJwt } from '../index';
import { decodeJwt as decodeJwtResult, verifyJwt as verifyJwtResult } from '../verifyJwt';

describe('decodeJwt and verifyJwt audience claim types', () => {
  it('exposes the same optional RFC 7519 aud type on JwtPayload', () => {
    type PublicDecodeAud = ReturnType<typeof decodeJwt>['payload']['aud'];
    type PublicVerifyAud = Awaited<ReturnType<typeof verifyJwt>>['aud'];
    type ResultDecodeAud = NonNullable<ReturnType<typeof decodeJwtResult>['data']>['payload']['aud'];
    type ResultVerifyAud = NonNullable<Awaited<ReturnType<typeof verifyJwtResult>>['data']>['aud'];

    expectTypeOf<PublicDecodeAud>().toEqualTypeOf<JwtPayload['aud']>();
    expectTypeOf<PublicVerifyAud>().toEqualTypeOf<JwtPayload['aud']>();
    expectTypeOf<ResultDecodeAud>().toEqualTypeOf<JwtPayload['aud']>();
    expectTypeOf<ResultVerifyAud>().toEqualTypeOf<JwtPayload['aud']>();
    expectTypeOf<JwtPayload['aud']>().toEqualTypeOf<string | string[] | undefined>();
  });
});
