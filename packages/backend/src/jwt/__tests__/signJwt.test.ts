import type { JwtPayload } from '@clerk/shared/types';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  mockJwtHeader,
  mockJwtPayload,
  pemEncodedPublicKey,
  pemEncodedSignKey,
  publicJwks,
  signingJwks,
} from '../../fixtures';
import { signJwt } from '../signJwt';
import { verifyJwt } from '../verifyJwt';

describe('signJwt(payload, options)', () => {
  let payload: JwtPayload;

  beforeEach(() => {
    payload = {
      ...mockJwtPayload,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    } as JwtPayload;
  });

  it('signs a JWT with a JWK formatted secret', async () => {
    const { data = '' } = await signJwt(payload, signingJwks, {
      algorithm: mockJwtHeader.alg,
      header: mockJwtHeader,
    });
    expect(data).toBeTruthy();

    const { data: verifiedPayload } = await verifyJwt(data, { key: publicJwks });
    expect(verifiedPayload).toEqual(payload);
  });

  it('signs a JWT with a pkcs8 formatted secret', async () => {
    const { data = '' } = await signJwt(payload, pemEncodedSignKey, {
      algorithm: mockJwtHeader.alg,
      header: mockJwtHeader,
    });
    expect(data).toBeTruthy();

    const { data: verifiedPayload } = await verifyJwt(data, { key: pemEncodedPublicKey });
    expect(verifiedPayload).toEqual(payload);
  });
});
