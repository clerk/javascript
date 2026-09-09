import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response, sessionFixture, tokenFixture, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const action of ['client replacement', 'sign-out'])
  test(`${action} retires the previous completed authentication attempt`, async t => {
    const session = sessionFixture();
    const client = {
      ...fixtures.client,
      sessions: [session],
      last_active_session_id: session.id,
      sign_in: { ...fixtures.signIn, status: 'complete', created_session_id: session.id },
    };
    const f = await fixture({
      client,
      http: request => {
        if (action === 'sign-out' && new URL(request.url).pathname.endsWith('/sessions'))
          return response(fixtures.client);
        if (new URL(request.url).pathname.endsWith(`/sessions/${session.id}`))
          return response(session, {
            body: JSON.stringify({ response: session, client: { ...fixtures.client, id: 'replacement_client' } }),
          });
      },
    });
    t.after(f.dispose);
    const attempt = f.state.roots.signIn;
    const result =
      action === 'sign-out'
        ? await f.invoke(f.state.roots.clerk, 'Clerk.signOut')
        : await f.invoke(f.state.roots.session, 'Session.reload');
    assert.equal(result.failure, undefined);
    if (action === 'client replacement') assert.equal(f.resource(f.state.roots.clerk).clientId, 'replacement_client');
    assert.equal(f.resource(f.state.roots.signIn).status, 'needs_identifier');
    assert.equal((await f.invoke(attempt, 'SignIn.finalize')).failure?.code, 'stale_resource');
  });

test('a queued token-only response preserves the newly accepted client', async t => {
  const session = sessionFixture();
  const token = tokenFixture();
  const client = { ...fixtures.client, sessions: [session], last_active_session_id: session.id };
  const started = [deferred(), deferred()];
  const replies = [deferred(), deferred()];
  const writing = deferred(),
    releaseWrite = deferred();
  let holdWrite = false;
  const f = await fixture({
    client,
    credentialWrite: async value => {
      if (holdWrite && value === 'fixture_client_credential') {
        writing.resolve();
        await releaseWrite.promise;
      }
    },
    http: request => {
      const path = new URL(request.url).pathname;
      const index = path.endsWith(`/sessions/${session.id}`) ? 0 : path.endsWith('/tokens') ? 1 : -1;
      if (index < 0) return;
      started[index].resolve();
      return replies[index].promise;
    },
  });
  t.after(f.dispose);
  const reload = f.invoke(f.state.roots.session, 'Session.reload');
  await started[0].promise;
  const getToken = f.invoke(f.state.roots.session, 'Session.getToken', [{ skipCache: true }]);
  await started[1].promise;
  holdWrite = true;
  replies[0].resolve(
    response(session, { body: JSON.stringify({ response: session, client: { ...client, id: 'new_client' } }) }),
  );
  await writing.promise;
  replies[1].resolve(
    response(token, { headers: { authorization: 'rotated-token-only-credential' }, body: JSON.stringify(token) }),
  );
  releaseWrite.resolve();
  assert.equal((await reload).failure, undefined);
  const result = await getToken;
  assert.equal(result.failure, undefined, JSON.stringify(result));
  assert.equal(result.result, token.jwt);
  assert.equal(f.resource(f.state.roots.clerk).clientId, 'new_client');
  assert.equal(f.resource(f.state.roots.session).id, session.id);
  assert.equal(f.credential, 'rotated-token-only-credential');
});

for (const kind of ['signIn', 'signUp'])
  for (const clearServerAttempt of [false, true]) {
    test(`completed ${kind} survives an ordinary refresh before finalization: cleared=${clearServerAttempt}`, async t => {
      const current = { ...sessionFixture(), id: 'session_current' };
      const created = { ...sessionFixture(), id: 'session_created' };
      const field = kind === 'signIn' ? 'sign_in' : 'sign_up';
      const type = kind === 'signIn' ? 'SignIn' : 'SignUp';
      const complete = { ...fixtures[kind], status: 'complete', created_session_id: created.id };
      const client = {
        ...fixtures.client,
        sessions: [current],
        last_active_session_id: current.id,
        [field]: fixtures[kind],
      };
      const completedClient = { ...client, sessions: [current, created], [field]: complete };
      const f = await fixture({
        client,
        http: request => {
          const path = new URL(request.url).pathname;
          if (path.endsWith(kind === 'signIn' ? '/attempt_first_factor' : '/attempt_verification'))
            return response(complete, {
              body: JSON.stringify({ response: complete, client: completedClient }),
            });
          if (path.endsWith(`/sessions/${current.id}`))
            return response(current, {
              body: JSON.stringify({
                response: current,
                client: { ...completedClient, [field]: clearServerAttempt ? null : complete },
              }),
            });
          if (path.endsWith('/touch'))
            return response(created, {
              body: JSON.stringify({
                response: created,
                client: { ...completedClient, last_active_session_id: created.id },
              }),
            });
          if (path.includes('/tokens')) return response(tokenFixture(), { body: JSON.stringify(tokenFixture()) });
        },
      });
      t.after(f.dispose);
      const attempt = f.state.roots[kind];
      const group = f.group(kind, kind === 'signIn' ? 'emailCode' : 'verifications');
      const verification = await f.invoke(
        group,
        `${group.type}.${kind === 'signIn' ? 'verifyCode' : 'verifyEmailCode'}`,
        [{ code: '123456' }],
      );
      assert.deepEqual(verification.result, { error: null }, JSON.stringify(verification));
      assert.equal(f.resource(f.state.roots[kind]).createdSessionId, created.id);
      assert.equal(f.resource(f.state.roots.session).id, current.id);
      assert.equal((await f.invoke(f.state.roots.session, 'Session.reload')).failure, undefined);
      assert.deepEqual(f.state.roots[kind], attempt);
      assert.equal(f.resource(attempt).status, 'complete');
      assert.equal(f.resource(attempt).createdSessionId, created.id);
      assert.equal(f.resource(f.state.roots.session).id, current.id);
      const finalized = await f.invoke(attempt, `${type}.finalize`);
      assert.deepEqual(finalized.result, { error: null }, JSON.stringify(finalized));
      assert.equal(f.resource(f.state.roots.session).id, created.id);
    });
  }
