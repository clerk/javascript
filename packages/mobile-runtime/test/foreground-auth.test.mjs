import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

test('foreground recovery does not invalidate an in-flight OAuth callback redemption', { timeout: 5000 }, async t => {
  const redeeming = deferred();
  const redemption = deferred();
  let clientReads = 0;
  const complete = { ...fixtures.signIn, status: 'complete', created_session_id: 'sess_native' };
  const f = await fixture({
    http: async (request, state) => {
      const path = new URL(request.url).pathname;
      if (path.endsWith('/client') && ++clientReads > 1)
        return response(state.client, {
          headers: { authorization: 'foreground_rotated_credential' },
        });
      if (path.includes('/sign_ins')) {
        if (request.method === 'GET') {
          redeeming.resolve();
          const result = await redemption.promise;
          state.client = { ...fixtures.client, sign_in: complete };
          return result;
        }
        return response(fixtures.signIn);
      }
    },
  });
  t.after(() => {
    redemption.resolve(response(complete));
    f.dispose();
  });
  f.receive({ kind: 'lifecycle', state: 'background' });
  const attempt = f.invoke(f.state.roots.clerk, 'Clerk.authenticateWithSSO', [
    { strategy: 'oauth_google', start: 'signIn', transferable: false },
  ]);
  await redeeming.promise;
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(clientReads, 1);
  redemption.resolve(response(complete, { headers: { authorization: 'redemption_credential' } }));
  const result = await attempt;
  assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
  assert.equal(f.state.roots.session, null);
  const deadline = Date.now() + 1000;
  while (f.credential !== 'foreground_rotated_credential' && Date.now() < deadline)
    await new Promise(resolve => setTimeout(resolve, 1));
  assert.equal(clientReads, 2);
  assert.equal(f.credential, 'foreground_rotated_credential');
  assert.equal(f.resource(f.state.roots.signIn).status, 'complete');
});

for (const outcome of ['failure', 'cancelled', 'background', 'offline', 'disposed']) {
  test(`queued foreground recovery respects ${outcome} while a resource call settles`, { timeout: 5000 }, async t => {
    const started = deferred();
    const finish = deferred();
    let reads = 0;
    const f = await fixture({
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/client')) reads++;
        if (path.endsWith('/sign_ups')) {
          started.resolve();
          return finish.promise;
        }
      },
    });
    t.after(() => {
      finish.resolve(response(fixtures.signUp));
      f.dispose();
    });
    const call = f.invoke(f.state.roots.signUp, 'SignUp.create', [{}], 'pending-auth');
    await started.promise;
    f.receive({ kind: 'lifecycle', state: 'background' });
    f.receive({ kind: 'lifecycle', state: 'foreground' });
    f.receive({ kind: 'connectivity', online: false });
    f.receive({ kind: 'connectivity', online: true });
    if (outcome === 'cancelled') {
      f.receive({ kind: 'cancel', id: 'pending-auth' });
      assert.equal((await call).failure.code, 'caller_cancelled');
    }
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(reads, 1);
    if (outcome === 'background') f.receive({ kind: 'lifecycle', state: 'background' });
    if (outcome === 'offline') f.receive({ kind: 'connectivity', online: false });
    if (outcome === 'disposed') f.dispose();
    finish.resolve(
      outcome === 'failure'
        ? response(null, {
            status: 422,
            body: JSON.stringify({ errors: [{ code: 'fixture_auth_failure', message: 'Rejected' }] }),
          })
        : response(fixtures.signUp),
    );
    if (outcome !== 'disposed') {
      const result = await call;
      if (outcome === 'failure') assert.equal(result.result.error.errors[0].code, 'fixture_auth_failure');
    }
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(reads, ['failure', 'cancelled'].includes(outcome) ? 2 : 1);
    if (outcome === 'background' || outcome === 'offline') {
      f.receive(
        outcome === 'background' ? { kind: 'lifecycle', state: 'foreground' } : { kind: 'connectivity', online: true },
      );
      await new Promise(resolve => setTimeout(resolve, 30));
      assert.equal(reads, 2);
    }
  });
}
