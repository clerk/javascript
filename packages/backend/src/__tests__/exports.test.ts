import type QUnit from 'qunit';

import * as errorExports from '../errors';
import * as publicExports from '../index';
import * as internalExports from '../internal';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('public exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
        'AllowlistIdentifier',
        'Client',
        'DeletedObject',
        'Email',
        'EmailAddress',
        'ExternalAccount',
        'IdentificationLink',
        'Invitation',
        'OauthAccessToken',
        'ObjectType',
        'Organization',
        'OrganizationInvitation',
        'OrganizationMembership',
        'OrganizationMembershipPublicUserData',
        'PhoneNumber',
        'RedirectUrl',
        'SMSMessage',
        'Session',
        'SignInToken',
        'Token',
        'User',
        'Verification',
        'createClerkClient',
        'decodeJwt',
        'hasValidSignature',
        'signJwt',
        'verifyJwt',
        'verifyToken',
      ];
      assert.deepEqual(Object.keys(publicExports).sort(), exportedApiKeys);
    });
  });

  module('subpath /errors exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
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
        'buildRequestUrl',
        'constants',
        'createAuthenticateRequest',
        'createIsomorphicRequest',
        'debugRequestState',
        'makeAuthObjectSerializable',
        'prunePrivateMetadata',
        'redirect',
        'sanitizeAuthObject',
        'signedInAuthObject',
        'signedOutAuthObject',
      ];
      assert.deepEqual(Object.keys(internalExports).sort(), exportedApiKeys);
    });
  });
};
