import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const credential of [null, 'restored-client-credential']) {
  test(`canonical client without a response credential requires ${credential ? 'the restored credential' : 'a credential before hydration'}`, async t => {
    const f = await fixture({
      credential,
      allowFailure: true,
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/environment')) return response(fixtures.environment, { headers: {} });
        if (path.endsWith('/client')) return response(fixtures.authenticatedClient, { headers: {} });
      },
    });
    t.after(f.dispose);
    if (credential) {
      assert.equal(f.ready.kind, 'ready', JSON.stringify(f.ready));
      assert.equal(f.resource(f.state.roots.session).status, 'active');
      assert.equal(f.credential, credential);
    } else {
      assert.equal(f.ready.kind, 'initializationFailed', JSON.stringify(f.ready));
      assert.equal(f.ready.failure.code, 'missing_client_credential');
      assert.equal(f.state, undefined);
      assert.equal(f.credential, null);
    }
  });
}
