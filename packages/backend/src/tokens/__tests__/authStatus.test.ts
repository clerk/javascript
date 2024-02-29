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
