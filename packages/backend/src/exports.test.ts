import type QUnit from 'qunit';

import * as publicExports from './index';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('public exports', () => {
    test('should not include a breaking change', assert => {
      const exportedApiKeys = [
        'AllowlistIdentifier',
        'AuthStatus',
        'Clerk',
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
        'Permission',
        'PhoneNumber',
        'RedirectUrl',
        'Role',
        'SMSMessage',
        'Session',
        'SignInToken',
        'Token',
        'TokenVerificationError',
        'TokenVerificationErrorAction',
        'TokenVerificationErrorCode',
        'TokenVerificationErrorReason',
        'User',
        'Verification',
        'buildRequestUrl',
        'constants',
        'createAuthenticateRequest',
        'createIsomorphicRequest',
        'debugRequestState',
        'decodeJwt',
        'deserialize',
        'hasValidSignature',
        'loadInterstitialFromLocal',
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
};
