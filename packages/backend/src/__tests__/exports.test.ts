import type QUnit from 'qunit';

import * as errorExports from '../errors';
import * as publicExports from '../index';
import * as internalExports from '../internal';
import * as jwtExports from '../jwt';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('public exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = ['createClerkClient', 'verifyToken'];
      assert.deepEqual(Object.keys(publicExports).sort(), exportedApiKeys);
    });
  });

  module('subpath /errors exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
        'SignJWTError',
        'TokenVerificationError',
        'TokenVerificationErrorAction',
        'TokenVerificationErrorCode',
        'TokenVerificationErrorReason',
      ];
      assert.deepEqual(Object.keys(errorExports).sort(), exportedApiKeys);
    });
  });

  module('subpath /internal exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
        'AuthStatus',
        'constants',
        'createAuthenticateRequest',
        'createClerkRequest',
        'createRedirect',
        'debugRequestState',
        'decorateObjectWithResources',
        'EPHEMERAL_MODE_AVAILABLE',
        'fetchEphemeralAccount',
        'makeAuthObjectSerializable',
        'signedInAuthObject',
        'signedOutAuthObject',
        'stripPrivateDataFromObject',
      ];
      assert.deepEqual(Object.keys(internalExports).sort(), exportedApiKeys);
    });
  });

  module('subpath /jwt exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = ['decodeJwt', 'hasValidSignature', 'signJwt', 'verifyJwt'];
      assert.deepEqual(Object.keys(jwtExports).sort(), exportedApiKeys);
    });
  });
};
