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
  for (const failure of ['storage', 'prepare']) {
    test(`${kind} email-link ${failure} failure preserves the persistence-before-request boundary`, async t => {
      let saved;
      let prepares = 0;
      const f = await magicFixture({
        authWrite: value => {
          if (failure === 'storage')
            throw Object.assign(new Error('Storage unavailable'), { code: 'secure_storage_locked' });
          saved = JSON.parse(value);
        },
        http: request => {
          if (!/prepare_first_factor|prepare_verification/.test(request.url)) return;
          prepares++;
          assert.equal(saved.kind, kind);
          assert.equal(saved.flowId, kind === 'signIn' ? 'sia_native' : 'sua_native');
          assert.match(saved.codeVerifier, /^[A-Za-z0-9_-]{43}$/);
          return response(null, {
            status: 422,
            body: JSON.stringify({ errors: [{ code: 'prepare_rejected', message: 'Preparation rejected' }] }),
          });
        },
      });
      t.after(f.dispose);
      const result = await sendLink(f, kind);
      assert.equal(result.failure, undefined, JSON.stringify(result.failure));
      if (failure === 'storage') {
        assert.equal(result.result.error.code, 'secure_storage_locked');
        assert.equal(prepares, 0);
        assert.equal(f.authRecord, null);
      } else {
        assert.equal(result.result.error.errors[0].code, 'prepare_rejected');
        assert.equal(prepares, 1);
        assert.deepEqual(JSON.parse(f.authRecord), saved);
      }
      assert.equal(f.state.roots.session, null);
    });
  }
}

for (const kind of ['signIn', 'signUp']) {
  test(`native ${kind} email link stores PKCE and returns the canonical resource without activation`, async t => {
    const f = await magicFixture();
    t.after(f.dispose);
    const sent = await sendLink(f, kind);
    assert.equal(sent.failure, undefined, JSON.stringify(sent.failure));
    const stored = JSON.parse(f.authRecord);
    assert.equal(stored.kind, kind);
    assert.equal(stored.codeVerifier.length, 43);
    assert.match(stored.codeVerifier, /^[A-Za-z0-9_-]+$/);
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

for (const route of [
  `${callbackUrl}#flow_id=sia_native&approval_token=fixture_approval`,
  `${callbackUrl}/?flow_id=sia_native&approval_token=fixture_approval`,
  'CLERK-TEST://SSO-CALLBACK/#flow_id=sia_native&approval_token=fixture_approval',
]) {
  test(`preserves the previous native email-link route form ${route}`, async t => {
    const f = await magicFixture();
    t.after(f.dispose);
    await sendLink(f);
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.handleAuthCallback', [route]);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.ok(result.result, 'The previous SDK accepted this callback route');
    assert.equal(result.result.value.signIn.$ref.id, f.state.roots.signIn.id);
    assert.equal(f.state.roots.session, null);
    assert.equal(f.authRecord, null);
    const completion = f.requests.find(request => request.url.includes('/magic_links/complete'));
    assert.equal(new URLSearchParams(completion.body).get('approval_token'), 'fixture_approval');
  });
}

test('email-link route mismatches and incomplete callbacks do not consume stored credentials', async t => {
  const f = await magicFixture();
  t.after(f.dispose);
  await sendLink(f);
  const saved = f.authRecord;
  const count = f.requests.length;
  for (const route of [
    'clerk-test:/sso-callback?flow_id=sia_native&approval_token=x',
    'clerk-test://wrong?flow_id=sia_native&approval_token=x',
    'clerk-test://sso-callback/extra?flow_id=sia_native&approval_token=x',
    'other://sso-callback?flow_id=sia_native&approval_token=x',
    `${callbackUrl}?approval_token=x`,
    `${callbackUrl}#flow_id=sia_native`,
  ]) {
    const result = await f.invoke(f.state.roots.clerk, 'Clerk.handleAuthCallback', [route]);
    assert.equal(result.failure, undefined);
    assert.equal(result.result, null);
  }
  assert.equal(f.requests.length, count);
  assert.equal(f.authRecord, saved);
});

test('email-link query values take precedence over fragment values', async t => {
  const f = await magicFixture();
  t.after(f.dispose);
  await sendLink(f);
  const count = f.requests.length;
  const result = await f.invoke(f.state.roots.clerk, 'Clerk.handleAuthCallback', [
    `${callbackUrl}?flow_id=wrong&approval_token=query#flow_id=sia_native&approval_token=fragment`,
  ]);
  assert.equal(result.failure.code, 'email_link_flow_mismatch');
  assert.equal(f.requests.length, count);
  assert.ok(f.authRecord);
});

for (const state of ['UNSUPPORTED', '', null, 7]) {
  test(`invalid Android email-link state is discarded before redemption: ${JSON.stringify(state)}`, async t => {
    const now = Date.now();
    const f = await magicFixture({
      authRecord: JSON.stringify({
        state,
        flowId: 'sia_native',
        codeVerifier: 'v'.repeat(43),
        createdAtEpochMs: now,
        expiresAtEpochMs: now + 600000,
      }),
    });
    t.after(f.dispose);
    const before = f.requests.length;
    const result = await handle(f);
    assert.equal(result.failure?.code, 'no_pending_email_link', JSON.stringify(result.failure));
    assert.equal(f.requests.length, before);
    assert.equal(f.authRecord, null);
    assert.equal(f.state.roots.session, null);
  });
}

for (const kind of [undefined, null]) {
  test(`legacy iOS absent email-link kind remains a sign-in record: ${kind}`, async t => {
    const now = Date.now();
    const f = await magicFixture({
      authRecord: JSON.stringify({
        kind,
        flow_id: 'sia_native',
        code_verifier: 'v'.repeat(43),
        created_at: now,
        expires_at: now + 600000,
      }),
    });
    t.after(f.dispose);
    const result = await handle(f);
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.equal(result.result.value.kind, 'signIn');
    assert.equal(f.authRecord, null);
  });
}

for (const kind of ['signIn', 'signUp']) {
  test(`incomplete ${kind} email-link completion publishes remaining requirements without activation`, async t => {
    const f = await magicFixture({
      http: request => {
        const path = new URL(request.url).pathname;
        if (kind === 'signIn' && path.endsWith('/sign_ins'))
          return response({ ...fixtures.signIn, status: 'needs_second_factor', created_session_id: null });
        if (kind === 'signUp' && path.endsWith('/magic_links/complete'))
          return response({
            ...fixtures.signUp,
            status: 'missing_requirements',
            created_session_id: null,
            missing_fields: ['first_name'],
          });
      },
    });
    t.after(f.dispose);
    await sendLink(f, kind);
    const result = await handle(f, kind === 'signIn' ? 'sia_native' : 'sua_native');
    assert.equal(result.failure, undefined, JSON.stringify(result.failure));
    assert.deepEqual(result.result.value[kind].$ref, f.state.roots[kind]);
    assert.equal(
      f.resource(f.state.roots[kind]).status,
      kind === 'signIn' ? 'needs_second_factor' : 'missing_requirements',
    );
    assert.equal(f.resource(f.state.roots[kind]).createdSessionId, null);
    const callback = f.resource(f.state.roots.clerk).authCallback;
    assert.deepEqual(callback.result.value[kind].$ref, f.state.roots[kind]);
    assert.equal(f.authRecord, null);
    assert.equal(f.state.roots.session, null);
    if (kind === 'signUp') {
      assert.deepEqual(f.resource(f.state.roots.signUp).missingFields, ['first_name']);
      assert.equal(
        f.requests.some(r => new URL(r.url).pathname.endsWith('/sign_ups')),
        false,
      );
    }
  });
}

for (const invalid of ['ticket', 'wrong-signup', 'null']) {
  test(`sign-up email-link rejects ${invalid} completion and consumes its verifier`, async t => {
    const f = await magicFixture({
      http: request =>
        request.url.includes('/magic_links/complete')
          ? response(
              invalid === 'ticket'
                ? { ticket: 'unexpected_ticket' }
                : invalid === 'wrong-signup'
                  ? { ...fixtures.signUp, id: 'sua_wrong' }
                  : null,
            )
          : undefined,
    });
    t.after(f.dispose);
    await sendLink(f, 'signUp');
    const result = await handle(f, 'sua_native');
    assert.equal(result.failure?.code, 'invalid_email_link_response');
    assert.equal(f.authRecord, null);
    assert.equal(f.state.roots.session, null);
    assert.equal(f.resource(f.state.roots.clerk).authCallback, null);
    assert.equal(
      f.requests.some(r => /\/sign_(ins|ups)$/.test(new URL(r.url).pathname)),
      false,
    );
  });
}

test('starting a newer email link fences an old completion and preserves the new verifier', async t => {
  const started = deferred(),
    finish = deferred();
  const f = await magicFixture({
    http: async request => {
      if (!request.url.includes('/magic_links/complete')) return;
      started.resolve();
      await finish.promise;
      return response({ ticket: 'obsolete_ticket' });
    },
  });
  t.after(f.dispose);
  await sendLink(f);
  const completing = handle(f);
  await started.promise;
  const sent = await sendLink(f, 'signUp');
  assert.equal(sent.result.error, null);
  const newer = f.authRecord;
  finish.resolve();
  const result = await completing;
  assert.equal(result.failure?.code, 'stale_authentication_attempt');
  assert.equal(f.authRecord, newer);
  assert.equal(JSON.parse(newer).kind, 'signUp');
  assert.equal(f.state.roots.session, null);
  assert.equal(f.resource(f.state.roots.clerk).authCallback, null);
  assert.equal(
    f.requests.some(r => new URL(r.url).pathname.endsWith('/sign_ins')),
    false,
  );
});

for (const [code, status, param, clear] of [
  ['approval_token_consumed', 422, undefined, true],
  ['approval_token_invalid', 422, undefined, true],
  ['pkce_verification_failed', 422, undefined, true],
  ['flow_not_approved', 422, undefined, true],
  ['form_param_value_invalid', 422, 'flow_id', true],
  ['form_param_value_invalid', 422, 'identifier', false],
  ['server_error', 500, undefined, false],
  ['too_many_requests', 429, undefined, false],
]) {
  test(`email-link error ${code}/${param ?? status} preserves the canonical cleanup policy`, async t => {
    const f = await magicFixture({
      http: request =>
        request.url.includes('/magic_links/complete')
          ? response(null, {
              status,
              body: JSON.stringify({ errors: [{ code, message: 'Completion rejected', meta: { param_name: param } }] }),
            })
          : undefined,
    });
    t.after(f.dispose);
    await sendLink(f);
    const saved = f.authRecord;
    const result = await handle(f);
    assert.equal(result.failure.errors[0].code, code);
    assert.equal(result.failure.status, status);
    assert.equal(f.authRecord, clear ? null : saved);
    assert.equal(
      f.requests.some(r => new URL(r.url).pathname.endsWith('/sign_ins')),
      false,
    );
    assert.equal(f.resource(f.state.roots.clerk).authCallback, null);
    assert.equal(f.state.roots.session, null);
  });
}
