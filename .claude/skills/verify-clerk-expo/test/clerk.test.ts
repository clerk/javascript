import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { inspect } from 'node:util';
import { REPLACE_AT_USERS, TEST_PHONES, createClerkBackends, newTestEmail, newTestPassword } from '../src/core/clerk.ts';
import { Secret, redact, usedSecretValues } from '../src/core/secret.ts';
import { VerifyFailure, type PublishableKey, type RunId } from '../src/core/types.ts';

function fakeBapi(routes: Record<string, { status: number; body: unknown }>) {
  const calls: string[] = [];
  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${String(url).replace('https://api.clerk.com/v1', '').split('?')[0]}`;
    calls.push(key);
    const route = routes[key] ?? { status: 404, body: { errors: [{ code: 'resource_not_found' }] } };
    return new Response(JSON.stringify(route.body), { status: route.status });
  }) as typeof fetch;
  const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };
  return { calls, backend: createClerkBackends(fetchImpl)(() => keys) };
}

describe('the users of a development instance', () => {
  const email = newTestEmail('r20261003-000000-abcd' as RunId, 1);

  it('counts them with the instance\'s own key', async () => {
    const { calls, backend } = fakeBapi({ 'GET /users/count': { status: 200, body: { object: 'total_count', total_count: 61 } } });
    assert.equal(await backend.userCount(), 61);
    assert.deepEqual(calls, ['GET /users/count']);
  });

  it('gives each call a time limit, so a stalled API cannot hold the instances lock for good', async () => {
    const signals: (AbortSignal | null | undefined)[] = [];
    const fetchImpl = (async (_url: string | URL, init?: RequestInit) => {
      signals.push(init?.signal);
      return new Response(JSON.stringify({ object: 'total_count', total_count: 0 }), { status: 200 });
    }) as typeof fetch;
    const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };
    await createClerkBackends(fetchImpl)(() => keys).userCount();
    assert.ok(signals[0] instanceof AbortSignal);
  });

  it('gives a user a password of its own only when asked, and never shows it', async () => {
    const bodies: Record<string, unknown>[] = [];
    const fetchImpl = (async (_url: string | URL, init?: RequestInit) => {
      bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(JSON.stringify({ id: `user_${bodies.length}` }), { status: 200 });
    }) as typeof fetch;
    const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };
    const backend = createClerkBackends(fetchImpl)(() => keys);

    const plain = await backend.createUser(email, null, null);
    assert.deepEqual([plain.password, bodies[0]!.skip_password_requirement, 'password' in bodies[0]!], [null, true, false]);

    const one = await backend.createUser(email, null, newTestPassword());
    const two = await backend.createUser(email, null, newTestPassword());
    const [first, second] = [String(bodies[1]!.password), String(bodies[2]!.password)];
    assert.notEqual(first, second, 'each user has its own password');
    for (const sent of [first, second]) assert.match(sent, /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/, 'it meets the password rules of the standard settings');
    assert.deepEqual([bodies[1]!.bypass_client_trust, 'skip_password_requirement' in bodies[1]!], [true, false], 'a password sign-in on a new device asks for no second step');
    assert.equal(one.password!.use('device-input', (value) => value), first, 'the spec can type the password Clerk was sent');
    for (const shown of [String(one.password), JSON.stringify(one), inspect(one), JSON.stringify(two)]) assert.equal(shown.includes(first) || shown.includes(second), false);
    assert.equal(redact(`typed ${first}`), 'typed <redacted>');
    assert.ok(usedSecretValues().includes(first), 'the evidence scan looks for it');
  });

  it('says whether a user holds a test phone', async () => {
    const phone = TEST_PHONES[7]!;
    const asked: string[] = [];
    const fetchImpl = (async (url: string | URL) => {
      asked.push(String(url));
      return new Response(JSON.stringify(asked.length === 1 ? [{ id: 'user_1' }] : []), { status: 200 });
    }) as typeof fetch;
    const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };
    const backend = createClerkBackends(fetchImpl)(() => keys);
    assert.deepEqual([await backend.phoneTaken(phone), await backend.phoneTaken(phone)], [true, false]);
    assert.equal(asked[0], `https://api.clerk.com/v1/users?phone_number=${encodeURIComponent(phone)}`);
  });

  it('turns the refusal of one user too many into a fix a person can follow', async () => {
    const { backend } = fakeBapi({ 'POST /users': { status: 403, body: { errors: [{ code: 'user_quota_exceeded' }] } } });
    await assert.rejects(backend.createUser(email, null, null), (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'INSTANCE_MISCONFIGURED' && error.fix === `the next \`{cli} run\` replaces the instance once it holds ${REPLACE_AT_USERS} users; rerun`);
    const other = fakeBapi({ 'POST /users': { status: 403, body: { errors: [{ code: 'something_else' }] } } });
    await assert.rejects(other.backend.createUser(email, null, null), (error: Error) => !(error instanceof VerifyFailure) && /answered 403/.test(error.message));
  });
});
