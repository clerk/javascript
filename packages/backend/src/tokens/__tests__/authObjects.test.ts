import type { JwtPayload } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import type { AuthenticateContext } from '../authenticateContext';
import {
  authenticatedMachineObject,
  makeAuthObjectSerializable,
  signedInAuthObject,
  signedOutAuthObject,
} from '../authObjects';

describe('makeAuthObjectSerializable', () => {
  it('removes non-serializable props', () => {
    const authObject = signedOutAuthObject();
    const serializableAuthObject = makeAuthObjectSerializable(authObject);

    for (const key in serializableAuthObject) {
      expect(typeof serializableAuthObject[key]).not.toBe('function');
    }
  });
});

describe('signedInAuthObject', () => {
  it('getToken returns the token passed in', async () => {
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
    expect(token).toBe('token');
  });
});

describe('authenticatedMachineObject', () => {
  it('getToken returns the token passed in', async () => {
    const authObject = authenticatedMachineObject('token', {
      act: null,
      sid: null,
      org_id: null,
      org_role: null,
      org_slug: null,
      org_permissions: null,
      sub: 'mch_id',
    } as unknown as JwtPayload);

    const token = authObject.getToken();
    expect(token).toBe('token');
  });
});
