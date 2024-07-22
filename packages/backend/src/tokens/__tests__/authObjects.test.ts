import type { JwtPayload } from '@clerk/types';
import type QUnit from 'qunit';

import type { AuthenticateContext } from '../authenticateContext';
import { makeAuthObjectSerializable, signedInAuthObject, signedOutAuthObject } from '../authObjects';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('makeAuthObjectSerializable', () => {
    test('removes non-serializable props', assert => {
      const authObject = signedOutAuthObject();
      const serializableAuthObject = makeAuthObjectSerializable(authObject);

      for (const key in serializableAuthObject) {
        assert.notStrictEqual(typeof serializableAuthObject[key], 'function');
      }
    });
  });

  module('signedInAuthObject', () => {
    test('getToken returns the token passed in', async assert => {
      const mockAuthenticateContext = { sessionToken: 'authContextToken' } as AuthenticateContext;
      const authObject = signedInAuthObject(mockAuthenticateContext, 'token', {
        act: 'actor',
        sid: 'sessionId',
        org_id: 'orgId',
        org_role: 'orgRole',
        org_slug: 'orgSlug',
        org_permissions: 'orgPermissions',
        sub: 'userId',
      } as unknown as JwtPayload);

      const token = await authObject.getToken();
      assert.strictEqual(token, 'token');
    });
  });
};
