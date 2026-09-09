import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { fixture, response, callbackUrl, deferred } from './protocol-fixture.mjs';
import { fixtures } from './native-fixtures.mjs';

async function magicFixture(options = {}) {
  const client = structuredClone(fixtures.client);
  client.sign_in = {
    ...fixtures.signIn,
    supported_first_factors: [
      { strategy: 'email_link', email_address_id: 'idn_email', safe_identifier: 't***@example.com' },
    ],
  };
  client.sign_up = { ...fixtures.signUp, email_address: 'test@example.com' };
  return fixture({
    client,
    capabilities: ['authStorage', 'crypto.sha256'],
    ...options,
    http: async request => {
      const custom = await options.http?.(request);
      if (custom) return custom;
      const path = new URL(request.url).pathname;
      if (path.endsWith('/magic_links/complete')) {
        const flow = new URLSearchParams(request.body).get('flow_id');
        return response(
          flow === 'sua_native'
            ? { ...client.sign_up, status: 'complete', created_session_id: 'sess_link' }
            : { ticket: 'fixture_ticket' },
        );
      }
      if (path.endsWith('/sign_ins'))
        return response({ ...client.sign_in, status: 'complete', created_session_id: 'sess_link' });
      if (path.includes('/sign_ins/')) return response(client.sign_in);
      if (path.includes('/sign_ups/')) return response(client.sign_up);
    },
  });
}
const sendLink = (f, kind = 'signIn') =>
  kind === 'signIn'
    ? f.invoke(f.group('signIn', 'emailLink'), 'SignInEmailLink.sendLink', [
        { $case: 1, value: { emailAddressId: 'idn_email' } },
      ])
    : f.invoke(f.group('signUp', 'verifications'), 'SignUpVerifications.sendEmailLink', [{}]);
const handle = (f, flow = 'sia_native', token = 'fixture_approval') =>
  f.invoke(f.state.roots.clerk, 'Clerk.handleAuthCallback', [`${callbackUrl}?flow_id=${flow}&approval_token=${token}`]);

for (const kind of ['signIn', 'signUp']) {
  test(`native ${kind} email link stores PKCE and returns the canonical resource without activation`, async t => {
    const f = await magicFixture();
    t.after(f.dispose);
    const sent = await sendLink(f, kind);
    assert.equal(sent.failure, undefined, JSON.stringify(sent.failure));
    const stored = JSON.parse(f.authRecord);
    assert.equal(stored.kind, kind);
    assert.equal(stored.expiresAt - stored.createdAt, 600_000);
    const request = f.requests.find(r => /prepare_first_factor|prepare_verification/.test(r.url));
    const params = new URLSearchParams(request.body);
    assert.equal(params.get('redirect_uri'), callbackUrl);
    assert.equal(params.get('code_challenge_method'), 'S256');
    assert.equal(params.get('code_challenge'), createHash('sha256').update(stored.codeVerifier).digest('base64url'));
    const result = await handle(f, stored.flowId);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.deepEqual(result.result.value[kind].$ref, f.state.roots[kind]);
    assert.equal(f.resource(f.state.roots[kind]).status, 'complete');
    assert.equal(f.state.roots.session, null);
    assert.equal(f.authRecord, null);
    const record = f.resource(f.state.roots.clerk).authCallback;
    assert.equal(record.result.value[kind].$ref.id, f.state.roots[kind].id);
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes(stored.codeVerifier), false);
    assert.equal(JSON.stringify(f.messages.filter(m => m.state)).includes('fixture_approval'), false);
    await f.invoke(f.state.roots.clerk, 'Clerk.clearAuthCallback', [record.id + 1]);
    assert.ok(f.resource(f.state.roots.clerk).authCallback);
    await f.invoke(f.state.roots.clerk, 'Clerk.clearAuthCallback', [record.id]);
    assert.equal(f.resource(f.state.roots.clerk).authCallback, null);
  });
}

test('email-link callbacks survive restart and reject a different route or flow before HTTP', async t => {
  const first = await magicFixture();
  t.after(first.dispose);
  assert.equal((await sendLink(first)).failure, undefined);
  const second = await magicFixture({ authRecord: first.authRecord });
  t.after(second.dispose);
  const count = second.requests.length;
  const unrelated = await second.invoke(second.state.roots.clerk, 'Clerk.handleAuthCallback', [
    'other://route?flow_id=sia_native&approval_token=x',
  ]);
  assert.equal(unrelated.result, null);
  assert.equal((await handle(second, 'sia_wrong')).failure.code, 'email_link_flow_mismatch');
  assert.equal(second.requests.length, count);
  assert.equal((await handle(second)).failure, undefined);
});

test('concurrent callbacks share one completion request', async t => {
  const started = deferred(),
    reply = deferred();
  const f = await magicFixture({
    http: async request => {
      if (request.url.includes('/magic_links/complete')) {
        started.resolve();
        await reply.promise;
        return response({ ticket: 'fixture_ticket' });
      }
    },
  });
  t.after(f.dispose);
  await sendLink(f);
  const a = handle(f);
  await started.promise;
  const b = handle(f);
  reply.resolve();
  const results = await Promise.all([a, b]);
  for (const result of results) assert.equal(result.failure, undefined, JSON.stringify(result.failure));
  assert.equal(f.requests.filter(r => r.url.includes('/magic_links/complete')).length, 1);
});

for (const code of ['approval_token_expired', 'temporarily_unavailable']) {
  test(`email link ${code} ${code === 'approval_token_expired' ? 'clears' : 'preserves'} its saved verifier`, async t => {
    const f = await magicFixture({
      http: request =>
        request.url.includes('/magic_links/complete')
          ? response(null, {
              status: 400,
              body: JSON.stringify({ errors: [{ code, message: 'Fixture failure', long_message: 'Fixture failure' }] }),
            })
          : undefined,
    });
    t.after(f.dispose);
    await sendLink(f);
    assert.equal((await handle(f)).failure.errors[0].code, code);
    assert.equal(f.authRecord === null, code === 'approval_token_expired');
  });
}

test('reset during a secure-storage write clears the eventual record and does not prepare the factor', async t => {
  const started = deferred(),
    finish = deferred();
  const f = await magicFixture({
    authWrite: async () => {
      started.resolve();
      await finish.promise;
    },
  });
  t.after(f.dispose);
  const sending = sendLink(f);
  await started.promise;
  const resetting = f.invoke(f.state.roots.signIn, 'SignIn.reset');
  finish.resolve();
  await Promise.all([sending, resetting]);
  assert.equal(f.authRecord, null);
  assert.equal(
    f.requests.some(r => /prepare_first_factor/.test(r.url)),
    false,
  );
});

for (const platform of ['ios', 'android']) {
  test(`imports a saved ${platform} email-link record through the same source validation`, async t => {
    const now = Date.now();
    const authRecord = JSON.stringify(
      platform === 'ios'
        ? {
            kind: 'signUp',
            flow_id: 'sua_native',
            code_verifier: 'v'.repeat(43),
            created_at: now,
            expires_at: now + 600000,
          }
        : {
            state: 'SIGN_UP',
            flowId: 'sua_native',
            codeVerifier: 'v'.repeat(43),
            createdAtEpochMs: now,
            expiresAtEpochMs: now + 600000,
          },
    );
    const f = await magicFixture({ authRecord });
    t.after(f.dispose);
    const result = await handle(f, 'sua_native');
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.value.signUp.$ref.id, f.state.roots.signUp.id);
    assert.equal(f.authRecord, null);
  });
}

test('expired email-link records are removed before any completion request', async t => {
  const f = await magicFixture({
    authRecord: JSON.stringify({
      kind: 'signIn',
      flowId: 'sia_native',
      codeVerifier: 'v'.repeat(43),
      createdAt: Date.now() - 600001,
      expiresAt: Date.now() - 1,
    }),
  });
  t.after(f.dispose);
  const before = f.requests.length;
  assert.equal((await handle(f)).failure.code, 'no_pending_email_link');
  assert.equal(f.authRecord, null);
  assert.equal(f.requests.length, before);
});

test('reset fences a delayed completion response and its credential write', async t => {
  const started = deferred(),
    finish = deferred();
  const f = await magicFixture({
    http: async request => {
      if (request.url.includes('/magic_links/complete')) {
        started.resolve();
        await finish.promise;
        return response({ ticket: 'fixture_ticket' }, { headers: { authorization: 'late_magic_credential' } });
      }
    },
  });
  t.after(f.dispose);
  await sendLink(f);
  const completing = handle(f);
  await started.promise;
  await f.invoke(f.state.roots.signIn, 'SignIn.reset');
  finish.resolve();
  const result = await completing;
  assert.ok(result.failure);
  assert.equal(f.authRecord, null);
  assert.equal(f.credential, 'fixture_client_credential');
  assert.equal(f.resource(f.state.roots.clerk).authCallback, null);
  assert.equal(
    f.requests.some(r => new URL(r.url).pathname.endsWith('/sign_ins')),
    false,
  );
});
