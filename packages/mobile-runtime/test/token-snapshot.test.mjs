import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, response } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

for (const scenario of ['initial', 'clear', 'mintTie', 'stale', 'fresh', 'tie', 'expired']) {
  test(`generated token calls preserve canonical snapshot policy: ${scenario}`, async t => {
    const now = Math.floor(Date.now() / 1000);
    const token = (origin, name, expired = false) => {
      const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
      return {
        object: 'token',
        jwt: `${encode({ alg: 'none', typ: 'JWT', oiat: origin })}.${encode({ sid: 'sess_native', iat: now - 20, exp: now + (expired ? -10 : 3600) })}.${name}`,
      };
    };
    const initial = token(100, 'initial');
    const minted = token(scenario === 'mintTie' ? 100 : 200, 'minted', scenario === 'expired');
    const snapshot = token(
      scenario === 'fresh' ? 300 : scenario === 'tie' ? 200 : 50,
      'snapshot',
      scenario === 'expired',
    );
    const final = token(400, 'final');
    const client = structuredClone(fixtures.authenticatedClient);
    client.sessions[0].last_active_token = initial;
    const nextSession = { ...client.sessions[0], last_active_token: snapshot };
    const bodies = [];
    const f = await fixture({
      client,
      http: request => {
        const path = new URL(request.url).pathname;
        if (path.endsWith('/environment'))
          return response({
            ...fixtures.environment,
            auth_config: { ...fixtures.environment.auth_config, session_minter: true },
          });
        if (path.endsWith('/tokens')) {
          bodies.push(new URLSearchParams(request.body));
          const value = bodies.length === 1 ? minted : final;
          return response(value, { body: JSON.stringify(value) });
        }
        if (path.endsWith('/sessions/sess_native'))
          return response(nextSession, {
            body: JSON.stringify({ response: nextSession, client: { ...client, sessions: [nextSession] } }),
          });
      },
    });
    t.after(f.dispose);
    const session = f.state.roots.session;
    const getToken = async (options = {}) => {
      const result = await f.invoke(session, 'Session.getToken', [options]);
      assert.equal(result.failure, undefined, JSON.stringify(result));
      return result.result;
    };
    assert.equal(await getToken(), initial.jwt);
    assert.equal(bodies.length, 0);
    if (scenario === 'initial') return;
    if (scenario === 'clear') {
      assert.equal((await f.invoke(session, 'Session.clearCache')).failure, undefined);
      assert.equal(await getToken(), minted.jwt);
      assert.equal(bodies.length, 1);
      assert.equal(bodies[0].get('token'), initial.jwt);
      return;
    }
    assert.equal(await getToken({ skipCache: true }), minted.jwt);
    assert.equal(bodies[0].get('token'), initial.jwt);
    if (scenario === 'mintTie') {
      assert.equal(await getToken(), minted.jwt);
      assert.equal(bodies.length, 1);
      return;
    }
    assert.equal((await f.invoke(session, 'Session.reload')).failure, undefined);
    assert.deepEqual(f.state.roots.session, session);
    if (scenario === 'expired') {
      assert.equal(await getToken(), final.jwt);
      assert.equal(bodies.length, 2);
      assert.equal(bodies[1].get('token'), minted.jwt);
    } else {
      assert.equal(await getToken(), scenario === 'stale' ? minted.jwt : snapshot.jwt);
      assert.equal(bodies.length, 1);
    }
  });
}
