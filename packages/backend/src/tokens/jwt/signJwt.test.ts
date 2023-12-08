import type { JwtPayload } from '@clerk/types';
import type QUnit from 'qunit';

import {
  mockJwtHeader,
  mockJwtPayload,
  pemEncodedPublicKey,
  pemEncodedSignKey,
  publicJwks,
  signingJwks,
} from '../fixtures';
import { signJwt } from './signJwt';
import { verifyJwt } from './verifyJwt';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('signJwt(payload, options)', hooks => {
    let payload: JwtPayload;

    hooks.beforeEach(() => {
      payload = {
        ...mockJwtPayload,
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      } as JwtPayload;
    });

    test('signs a JWT with a JWK formatted secret', async assert => {
      const jwt = await signJwt(payload, signingJwks, {
        algorithm: mockJwtHeader.alg,
        header: mockJwtHeader,
      });

      const verifiedPayload = await verifyJwt(jwt, { key: publicJwks });
      assert.deepEqual(verifiedPayload, payload);
    });

    test('signs a JWT with a pkcs8 formatted secret', async assert => {
      const jwt = await signJwt(payload, pemEncodedSignKey, {
        algorithm: mockJwtHeader.alg,
        header: mockJwtHeader,
      });

      const verifiedPayload = await verifyJwt(jwt, { key: pemEncodedPublicKey });
      assert.deepEqual(verifiedPayload, payload);
    });
  });
};
