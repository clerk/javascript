// @vitest-environment node

import { describe, expect, it } from 'vitest';

import * as errorExports from '../errors';
import * as publicExports from '../index';
import * as internalExports from '../internal';
import * as jwtExports from '../jwt';

describe('public exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(publicExports).sort()).toMatchInlineSnapshot(`
      [
        "createClerkClient",
        "verifyToken",
      ]
    `);
  });
});

describe('subpath /errors exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(errorExports).sort()).toMatchInlineSnapshot(`
      [
        "SignJWTError",
        "TokenVerificationError",
        "TokenVerificationErrorAction",
        "TokenVerificationErrorCode",
        "TokenVerificationErrorReason",
      ]
    `);
  });
});

describe('subpath /internal exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(internalExports).sort()).toMatchInlineSnapshot(`
      [
        "AuthStatus",
        "authenticatedMachineObject",
        "constants",
        "createAuthenticateRequest",
        "createClerkRequest",
        "createRedirect",
        "debugRequestState",
        "decorateObjectWithResources",
        "makeAuthObjectSerializable",
        "reverificationError",
        "reverificationErrorResponse",
        "signedInAuthObject",
        "signedOutAuthObject",
        "stripPrivateDataFromObject",
        "unauthenticatedMachineObject",
      ]
    `);
  });
});

describe('subpath /jwt exports', () => {
  it('should not include a breaking change', () => {
    expect(Object.keys(jwtExports).sort()).toMatchInlineSnapshot(`
      [
        "decodeJwt",
        "hasValidSignature",
        "signJwt",
        "verifyJwt",
      ]
    `);
  });
});
