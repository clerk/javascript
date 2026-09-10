import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

test('a generated GET recovers from a transient network failure', async t => {
  const session = fixtures.authenticatedClient.sessions[0];
  const requests = [];
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      if (!new URL(request.url).pathname.endsWith(`/sessions/${session.id}`)) return;
      requests.push(request);
      if (requests.length === 1) throw new Error('Network connection lost');
      return response(session);
    },
  });
  t.after(f.dispose);
  const handle = f.state.roots.session;
  const result = await f.invoke(handle, 'Session.reload');
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(f.resource(handle).status, 'active');
  assert.equal(requests.length, 2);
  assert.equal(new URL(requests[0].url).searchParams.get('_clerk_retry_attempt'), null);
  assert.equal(new URL(requests[1].url).searchParams.get('_clerk_retry_attempt'), '1');
  assert.equal(requests[1].headers.authorization, requests[0].headers.authorization);
});

test('a generated authentication mutation does not replay after a lost response', async t => {
  let submissions = 0;
  const f = await fixture({
    http: request => {
      if (!new URL(request.url).pathname.endsWith('/sign_ins')) return;
      submissions++;
      throw new Error('Network connection lost');
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.signIn, 'SignIn.create', [{ identifier: 'test@example.com' }]);
  assert.ok(result.result?.error, JSON.stringify(result));
  assert.equal(submissions, 1);
  assert.equal(f.state.roots.session, null);
});

test('a persistent GET network failure stops at the core retry limit', async t => {
  const session = fixtures.authenticatedClient.sessions[0];
  const attempts = [];
  const f = await fixture({
    client: fixtures.authenticatedClient,
    timerMilliseconds: () => 0,
    http: request => {
      const url = new URL(request.url);
      if (!url.pathname.endsWith(`/sessions/${session.id}`)) return;
      attempts.push(url.searchParams.get('_clerk_retry_attempt'));
      throw new Error('Network unavailable');
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.session, 'Session.reload');
  assert.ok(result.failure, JSON.stringify(result));
  assert.deepEqual(attempts, [null, '1', '2', '3']);
  assert.equal(f.resource(f.state.roots.session).status, 'active');
});

for (const status of [400, 403, 404, 408, 422, 425, 429, 500, 502, 503, 504]) {
  test(`a generated GET surfaces HTTP ${status} without transport replay`, async t => {
    const session = fixtures.authenticatedClient.sessions[0];
    let calls = 0;
    const f = await fixture({
      client: fixtures.authenticatedClient,
      http: request => {
        if (!new URL(request.url).pathname.endsWith(`/sessions/${session.id}`)) return;
        calls++;
        return response(null, {
          status,
          headers: { 'retry-after': '2', 'x-ratelimit-reset': String(Date.now() / 1000 + 2) },
          body: JSON.stringify({ errors: [{ code: 'request_rejected', message: 'Request rejected' }] }),
        });
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.session, 'Session.reload');
    assert.equal(result.failure?.status, status);
    assert.equal(result.failure?.errors[0].code, 'request_rejected');
    assert.equal(calls, 1);
    assert.equal(f.resource(f.state.roots.session).status, 'active');
  });
}

test('an unauthorized client refresh does not recursively refresh the client', async t => {
  const session = fixtures.authenticatedClient.sessions[0];
  let clientReads = 0;
  let rejecting = true;
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/client') && ++clientReads === 1) return;
      if (!path.endsWith('/client') && !path.endsWith(`/sessions/${session.id}`)) return;
      if (!rejecting) return response(session);
      return response(null, {
        // Bound the broken recursion so a failing test terminates normally.
        status: clientReads >= 4 ? 403 : 401,
        headers: {},
        body: JSON.stringify({ errors: [{ code: 'authentication_invalid', message: 'Authentication invalid' }] }),
      });
    },
  });
  t.after(f.dispose);
  const result = await f.invoke(f.state.roots.session, 'Session.reload');
  assert.equal(result.failure?.status, 401);
  assert.equal(clientReads, 2, 'one startup read and one recovery read');
  assert.equal(f.resource(f.state.roots.session).status, 'active');
  rejecting = false;
  assert.equal((await f.invoke(f.state.roots.session, 'Session.reload')).failure, undefined);
});

test('concurrent unauthorized operations finish after their independent recovery requests', async t => {
  const session = fixtures.authenticatedClient.sessions[0];
  let clientReads = 0;
  const f = await fixture({
    client: fixtures.authenticatedClient,
    http: request => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/client') && ++clientReads === 1) return;
      if (!path.endsWith('/client') && !path.endsWith(`/sessions/${session.id}`)) return;
      return response(null, {
        status: 401,
        headers: {},
        body: JSON.stringify({ errors: [{ code: 'authentication_invalid', message: 'Authentication invalid' }] }),
      });
    },
  });
  t.after(f.dispose);
  const results = await Promise.all([
    f.invoke(f.state.roots.session, 'Session.reload'),
    f.invoke(f.state.roots.session, 'Session.reload'),
  ]);
  assert.ok(results.every(result => result.failure?.status === 401));
  assert.equal(clientReads, 3);
  assert.equal(f.resource(f.state.roots.session).status, 'active');
});

for (const transition of ['sign-out', 'credential-rotation']) {
  test(`a generated GET does not retry after ${transition}`, { timeout: 5000 }, async t => {
    const session = fixtures.authenticatedClient.sessions[0];
    const entered = deferred();
    const release = deferred();
    const attempts = [];
    const f = await fixture({
      client: fixtures.authenticatedClient,
      timerMilliseconds: () => 0,
      http: async request => {
        const url = new URL(request.url);
        if (url.pathname.endsWith(`/sessions/${session.id}`)) {
          attempts.push(request);
          if (attempts.length === 1) {
            entered.resolve();
            await release.promise;
            throw new Error('Network connection lost');
          }
          return response(session);
        }
        if (url.pathname.endsWith('/client/sessions'))
          return response({ ...fixtures.client, sessions: [], last_active_session_id: null });
        if (url.pathname.endsWith('/me'))
          return response(session.user, { headers: { authorization: 'rotated-client-credential' } });
      },
    });
    t.after(f.dispose);
    const request = f.invoke(f.state.roots.session, 'Session.reload');
    await entered.promise;
    const changed =
      transition === 'sign-out'
        ? await f.invoke(f.state.roots.clerk, 'Clerk.signOut')
        : await f.invoke(f.state.roots.user, 'User.reload');
    assert.equal(changed.failure, undefined, JSON.stringify(changed.failure));
    release.resolve();
    const result = await request;
    assert.ok(result.failure, JSON.stringify(result));
    assert.equal(attempts.length, 1);
    if (transition === 'sign-out') assert.equal(f.state.roots.session, null);
    else assert.equal(f.credential, 'rotated-client-credential');
  });
}
