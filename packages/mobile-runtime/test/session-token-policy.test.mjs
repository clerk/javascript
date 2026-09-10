import assert from 'node:assert/strict';
import test from 'node:test';
import { deferred, fixture, response, sessionFixture, tokenFixture } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const { name, minter, previous, options, expected } of [
  { name: 'first mint', minter: true, previous: false, options: {}, expected: { organization_id: '' } },
  {
    name: 'forced first mint',
    minter: true,
    previous: false,
    options: { skipCache: true },
    expected: { organization_id: '', force_origin: 'true' },
  },
  {
    name: 'previous token and forced origin',
    minter: true,
    previous: true,
    options: { skipCache: true },
    expected: { organization_id: '', force_origin: 'true', token: true },
  },
  {
    name: 'disabled minter',
    minter: false,
    previous: true,
    options: { skipCache: true },
    expected: { organization_id: '' },
  },
  {
    name: 'template ignores mint parameters',
    minter: true,
    previous: true,
    options: { template: 'firebase', organizationId: 'org_explicit', skipCache: true },
    expected: {},
  },
]) {
  test(`generated token request preserves shared policy: ${name}`, async t => {
    const session = sessionFixture();
    const initial = tokenFixture();
    if (previous) session.last_active_token = initial;
    const minted = { ...tokenFixture(), jwt: tokenFixture().jwt + '_minted' };
    const requests = [];
    const f = await fixture({
      client: { ...fixtures.client, sessions: [session], last_active_session_id: session.id },
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/environment'))
          return response({
            ...fixtures.environment,
            auth_config: { ...fixtures.environment.auth_config, session_minter: minter },
          });
        if (!path.includes('/tokens')) return;
        requests.push(request);
        return response(minted, { body: JSON.stringify(minted) });
      },
    });
    t.after(f.dispose);
    const result = await f.invoke(f.state.roots.session, 'Session.getToken', [options]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result, minted.jwt);
    assert.equal(requests.length, 1);
    const request = requests[0];
    assert.equal(request.method, 'POST');
    assert.equal(
      new URL(request.url).pathname,
      `/v1/client/sessions/${session.id}/tokens${options.template ? '/firebase' : ''}`,
    );
    assert.deepEqual(Object.fromEntries(new URLSearchParams(request.body)), {
      ...(!options.template ? { tab_state: 'focused' } : {}),
      ...expected,
      ...(expected.token ? { token: initial.jwt } : {}),
    });
    assert.equal(new URL(request.url).searchParams.get('debug'), options.skipCache ? 'skip_cache' : null);
  });
}

test('a nonselected available session coalesces token requests without changing selection', async t => {
  const selected = sessionFixture();
  const other = { ...sessionFixture(), id: 'sess_other' };
  const started = deferred();
  const gate = deferred();
  const minted = tokenFixture();
  let requests = 0;
  const f = await fixture({
    client: { ...fixtures.client, sessions: [selected, other], last_active_session_id: selected.id },
    http: request => {
      if (!new URL(request.url).pathname.endsWith('/sessions/sess_other/tokens/firebase')) return;
      requests++;
      started.resolve();
      return gate.promise;
    },
  });
  t.after(() => {
    gate.resolve(response(minted, { body: JSON.stringify(minted) }));
    f.dispose();
  });
  const selectedHandle = f.state.roots.session;
  const handle = f
    .resource(f.state.roots.clerk)
    .sessions.map(ref => ref.$ref)
    .find(ref => f.resource(ref).id === other.id);
  assert.ok(handle);
  const getToken = () => f.invoke(handle, 'Session.getToken', [{ template: 'firebase' }]);
  const first = getToken();
  await started.promise;
  const second = getToken();
  gate.resolve(response(minted, { body: JSON.stringify(minted) }));
  assert.equal((await first).result, minted.jwt);
  assert.equal((await second).result, minted.jwt);
  assert.equal((await getToken()).result, minted.jwt);
  assert.equal(requests, 1);
  assert.deepEqual(f.state.roots.session, selectedHandle);
});
