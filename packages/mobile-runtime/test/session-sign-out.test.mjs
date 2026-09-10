import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const scoped of [false, true]) {
  for (const rejected of [false, true]) {
    test(
      `generated sign-out request and cache policy: scoped=${scoped}, rejected=${rejected}`,
      { timeout: 5000 },
      async t => {
        const sessions = [sessionFixture(), { ...sessionFixture(), id: 'sess_other' }];
        const client = { ...fixtures.client, sessions, last_active_session_id: sessions[0].id };
        const minted = tokenFixture();
        let tokenRequests = 0;
        let signOutRequest;
        const f = await fixture({
          client,
          http: request => {
            const url = new URL(request.url);
            if (url.pathname.endsWith('/tokens/firebase')) {
              tokenRequests++;
              return response(minted, { body: JSON.stringify(minted) });
            }
            if (!url.pathname.endsWith(scoped ? '/sessions/sess_other/remove' : '/client/sessions')) return;
            signOutRequest = request;
            if (rejected)
              return response(null, {
                status: 500,
                body: JSON.stringify({ errors: [{ code: 'service_failure', message: 'Unavailable' }] }),
              });
            const next = {
              ...client,
              sessions: scoped ? [sessions[0]] : [],
              last_active_session_id: scoped ? sessions[0].id : null,
            };
            const value = scoped ? { ...sessions[1], status: 'removed' } : next;
            return response(value, { body: JSON.stringify({ response: value, client: next }) });
          },
        });
        t.after(f.dispose);
        const handles = () => f.resource(f.state.roots.clerk).sessions.map(value => value.$ref);
        const getToken = handle => f.invoke(handle, 'Session.getToken', [{ template: 'firebase' }]);
        const oldHandles = handles();
        for (const handle of oldHandles) assert.equal((await getToken(handle)).result, minted.jwt);
        assert.equal(tokenRequests, 2);
        const result = await f.invoke(f.state.roots.clerk, 'Clerk.signOut', [
          scoped ? { sessionId: 'sess_other' } : {},
        ]);
        assert.ok(signOutRequest);
        assert.equal(signOutRequest.method, 'POST');
        assert.equal(new URL(signOutRequest.url).searchParams.get('_method'), scoped ? null : 'DELETE');
        if (rejected) {
          assert.equal(result.failure?.status, 500);
          assert.equal(result.failure?.errors[0].code, 'service_failure');
          assert.equal(handles().length, 2);
          for (const handle of handles()) assert.equal((await getToken(handle)).result, minted.jwt);
          // Canonical Session.remove clears globally before HTTP; Client.removeSessions clears after success.
          assert.equal(tokenRequests, scoped ? 4 : 2);
        } else {
          assert.equal(result.failure, undefined, JSON.stringify(result.failure));
          assert.equal(handles().length, scoped ? 1 : 0);
          if (scoped) {
            assert.equal(f.resource(f.state.roots.session).id, sessions[0].id);
            assert.equal((await getToken(handles()[0])).result, minted.jwt);
            assert.equal(tokenRequests, 3);
          } else assert.equal(f.state.roots.session, null);
        }
        assert.equal((await getToken(oldHandles[1])).failure?.code, 'stale_resource');
      },
    );
  }
}
