import '../testing/git-env.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runEmailPrefix } from '../specs/support/clerk.ts';
import { Secret } from '../specs/support/secret.ts';
import { createClerkBackends } from '../src/core/clerk.ts';
import { VerifyFailure, type PublishableKey, type RunId } from '../src/core/types.ts';

const keys = { pk: 'pk_test_x' as PublishableKey, sk: new Secret('clerk-secret-key', 'sk_test_x') };

function fakeBapi(answer: { status: number; body: unknown }) {
  const calls: { readonly url: string; readonly signal: AbortSignal | null | undefined }[] = [];
  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: `${init?.method ?? 'GET'} ${String(url)}`, signal: init?.signal });
    return new Response(JSON.stringify(answer.body), { status: answer.status });
  }) as typeof fetch;
  return { calls, backend: createClerkBackends(fetchImpl)(() => keys) };
}

describe('what the CLI asks a development instance about its users', () => {
  const run = 'r20261003-000000-abcd' as RunId;
  const prefix = runEmailPrefix(run);

  it('counts them with the instance\'s own key', async () => {
    const { calls, backend } = fakeBapi({ status: 200, body: { object: 'total_count', total_count: 61 } });
    assert.equal(await backend.userCount(), 61);
    assert.deepEqual(calls.map((call) => call.url), ['GET https://api.clerk.com/v1/users/count']);
  });

  it('gives each call a time limit, so a stalled API cannot hold the instances lock for good', async () => {
    const { calls, backend } = fakeBapi({ status: 200, body: { object: 'total_count', total_count: 0 } });
    await backend.userCount();
    assert.ok(calls[0]!.signal instanceof AbortSignal);
  });

  it('lists the users of one run by the start of their addresses, in one request, whether a test seeded them or signed them up in the app', async () => {
    const { calls, backend } = fakeBapi({
      status: 200,
      body: [
        { id: 'user_1', email_addresses: [{ email_address: `${prefix}0a1b2c3d+clerk_test@example.com` }] },
        { id: 'user_2', email_addresses: [{ email_address: 'someone@example.com' }, { email_address: `${prefix}ffffffff+clerk_test@example.com` }] },
        { id: 'user_3', email_addresses: [{ email_address: `not_${prefix}00000000+clerk_test@example.com` }] },
        { id: 'user_4', email_addresses: [] },
        { email_addresses: [{ email_address: `${prefix}11111111+clerk_test@example.com` }] },
      ],
    });
    assert.deepEqual(await backend.usersOfRun(run), [
      { userId: 'user_1', email: `${prefix}0a1b2c3d+clerk_test@example.com` },
      { userId: 'user_2', email: `${prefix}ffffffff+clerk_test@example.com` },
    ]);
    assert.deepEqual(calls.map((call) => call.url), [`GET https://api.clerk.com/v1/users?limit=500&email_address_query=${prefix}`]);
  });

  it('says what to change when Clerk refuses the instance\'s own key, and names the request when it fails another way', async () => {
    await assert.rejects(fakeBapi({ status: 401, body: {} }).backend.usersOfRun(run), (error: VerifyFailure) => error instanceof VerifyFailure && error.code === 'NOT_READY' && /Path prefixes/.test(error.fix));
    await assert.rejects(fakeBapi({ status: 500, body: { errors: [{ code: 'internal' }] } }).backend.usersOfRun(run), /^Error: Clerk GET \/users answered 500 \(internal\)$/);
  });
});
