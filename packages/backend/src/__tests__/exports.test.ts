import type QUnit from 'qunit';

import * as errorExports from '../errors';
import * as publicExports from '../index';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('public exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
        'AllowlistIdentifier',
        'AuthStatus',
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
        'buildRequestUrl',
        'constants',
        'createAuthenticateRequest',
        'createClerkClient',
        'createIsomorphicRequest',
        'debugRequestState',
        'decodeJwt',
        'hasValidSignature',
        'makeAuthObjectSerializable',
        'prunePrivateMetadata',
        'redirect',
        'sanitizeAuthObject',
        'signJwt',
        'signedInAuthObject',
        'signedOutAuthObject',
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
};
