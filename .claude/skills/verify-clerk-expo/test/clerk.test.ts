import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { REPLACE_AT_USERS, createClerkBackends, newTestEmail } from '../src/core/clerk.ts';
import { Secret } from '../src/core/secret.ts';
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

  it('turns the refusal of one user too many into a fix a person can follow', async () => {
    const { backend } = fakeBapi({ 'POST /users': { status: 403, body: { errors: [{ code: 'user_quota_exceeded' }] } } });
    await assert.rejects(backend.createUser(email, null), (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'INSTANCE_MISCONFIGURED' && error.fix === `the next \`{cli} run\` replaces the instance once it holds ${REPLACE_AT_USERS} users; rerun`);
    const other = fakeBapi({ 'POST /users': { status: 403, body: { errors: [{ code: 'something_else' }] } } });
    await assert.rejects(other.backend.createUser(email, null), (error: Error) => !(error instanceof VerifyFailure) && /answered 403/.test(error.message));
  });
});
