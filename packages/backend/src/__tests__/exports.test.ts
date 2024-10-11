import { describe, expect, it } from 'vitest';

import * as errorExports from '../errors';
import * as publicExports from '../index';
import * as internalExports from '../internal';
import * as jwtExports from '../jwt';

describe('public exports', () => {
  it('should not include a breaking change', () => {
    const exportedApiKeys = ['createClerkClient', 'verifyToken'];

    expect(Object.keys(publicExports).sort()).toEqual(exportedApiKeys);
  });
});

describe('subpath /errors exports', () => {
  it('should not include a breaking change', () => {
    const exportedApiKeys = [
      'SignJWTError',
      'TokenVerificationError',
      'TokenVerificationErrorAction',
      'TokenVerificationErrorCode',
      'TokenVerificationErrorReason',
    ];

    expect(Object.keys(errorExports).sort()).toEqual(exportedApiKeys);
  });
});

describe('subpath /internal exports', () => {
  it('should not include a breaking change', () => {
    const exportedApiKeys = [
      'AuthStatus',
      'constants',
      'createAuthenticateRequest',
      'createClerkRequest',
      'createRedirect',
      'debugRequestState',
      'decorateObjectWithResources',
      'makeAuthObjectSerializable',
      'signedInAuthObject',
      'signedOutAuthObject',
      'stripPrivateDataFromObject',
    ];

    expect(Object.keys(internalExports).sort()).toEqual(exportedApiKeys);
  });
});

describe('subpath /jwt exports', () => {
  it('should not include a breaking change', () => {
    const exportedApiKeys = ['decodeJwt', 'hasValidSignature', 'signJwt', 'verifyJwt'];

    expect(Object.keys(jwtExports).sort()).toEqual(exportedApiKeys);
  });
});
