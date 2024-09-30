import type QUnit from 'qunit';

import { handshake, signedIn, signedOut } from '../authStatus';

export default (QUnit: QUnit) => {
  const { module, test } = QUnit;

  module('signed-in', () => {
    test('does not include debug headers', assert => {
      const authObject = signedIn({} as any, {} as any, undefined, 'token');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-status'), null);
      assert.strictEqual(authObject.headers.get('x-clerk-auth-reason'), null);
      assert.strictEqual(authObject.headers.get('x-clerk-auth-message'), null);
    });

    test('authObject returned by toAuth() returns the token passed', async assert => {
      const signedInAuthObject = signedIn({} as any, { sid: 'sid' } as any, undefined, 'token').toAuth();
      const token = await signedInAuthObject.getToken();
      assert.strictEqual(token, 'token');
    });
  });

  module('signed-out', () => {
    test('includes debug headers', assert => {
      const headers = new Headers({ 'custom-header': 'value' });
      const authObject = signedOut({} as any, 'auth-reason', 'auth-message', headers);

      assert.strictEqual(authObject.headers.get('custom-header'), 'value');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-status'), 'signed-out');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-reason'), 'auth-reason');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-message'), 'auth-message');
    });

    test('handles debug headers containing invalid unicode characters without throwing', assert => {
      const headers = new Headers({ 'custom-header': 'value' });
      const authObject = signedOut({} as any, 'auth-reason+RR�56', 'auth-message+RR�56', headers);

      assert.strictEqual(authObject.headers.get('custom-header'), 'value');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-status'), 'signed-out');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-reason'), null);
      assert.strictEqual(authObject.headers.get('x-clerk-auth-message'), null);
    });
  });

  module('handshake', () => {
    test('includes debug headers', assert => {
      const headers = new Headers({ location: '/' });
      const authObject = handshake({} as any, 'auth-reason', 'auth-message', headers);

      assert.strictEqual(authObject.headers.get('location'), '/');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-status'), 'handshake');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-reason'), 'auth-reason');
      assert.strictEqual(authObject.headers.get('x-clerk-auth-message'), 'auth-message');
    });
  });
};
