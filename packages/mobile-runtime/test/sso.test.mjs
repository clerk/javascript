import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createBaseClientJSON, createBaseEnvironmentJSON } from '../../clerk-js/src/test/fixtures.ts';

const bundle = fs.readFileSync(new URL('../dist/clerk-core-test.js', import.meta.url), 'utf8');
const publishableKey = `pk_test_${Buffer.from('native-core.clerk.accounts.dev$').toString('base64')}`;
const verificationURL = 'https://provider.example/authorize';
const callbackURL = 'clerk-test://sso-callback';

function verification(status = 'unverified') {
  return {
    status,
    strategy: 'oauth_google',
    external_verification_redirect_url: verificationURL,
    attempts: null,
    expire_at: null,
    error: null,
    verified_at_client: null,
    nonce: null,
    message: null,
  };
}

async function fixture(root, transportResult, finalStatus = 'complete') {
  const requests = [];
  const messages = [];
  const opened = [];
  let browserResolve;
  const context = vm.createContext({
    __clerkNativeRandom: length => randomBytes(length).toString('base64'),
    __clerkNativeEmit: value => {
      const message = JSON.parse(value);
      if (message.kind !== 'hostRequest') return;
      if (message.capability !== 'http') throw new Error(`Unexpected host capability: ${message.capability}`);
      const request = message.args;
      requests.push(request);
      const url = new URL(request.url);
      let payload;
      if (url.pathname.endsWith('/environment')) payload = createBaseEnvironmentJSON();
      else if (url.pathname.endsWith('/client'))
        payload = { ...createBaseClientJSON(), sessions: [], captcha_bypass: true };
      else {
        const reloading = request.method === 'GET';
        const status = reloading ? finalStatus : 'needs_first_factor';
        payload =
          root === 'signIn'
            ? {
                object: 'sign_in',
                id: 'sia_native',
                status,
                identifier: null,
                supported_first_factors: [],
                supported_second_factors: [],
                first_factor_verification: verification(reloading ? 'verified' : 'unverified'),
                second_factor_verification: null,
                created_session_id: reloading && finalStatus === 'complete' ? 'sess_native' : null,
                user_data: {},
              }
            : {
                object: 'sign_up',
                id: 'sua_native',
                status: reloading ? finalStatus : 'missing_requirements',
                required_fields: [],
                optional_fields: [],
                missing_fields: [],
                unverified_fields: [],
                verifications: { external_account: verification(reloading ? 'verified' : 'unverified') },
                unsafe_metadata: {},
                created_session_id: reloading && finalStatus === 'complete' ? 'sess_native' : null,
                username: null,
                first_name: null,
                last_name: null,
                email_address: null,
                phone_number: null,
                has_password: false,
                created_user_id: null,
                abandon_at: null,
                web3_wallet: null,
                legal_accepted_at: null,
                locale: null,
              };
      }
      queueMicrotask(() =>
        context.ClerkCore.hostReply({
          id: message.id,
          result: {
            status: 200,
            headers: { authorization: 'test-client-credential' },
            body: JSON.stringify({ response: payload }),
          },
        }),
      );
    },
  });
  vm.runInContext(bundle, context, { timeout: 10000 });
  assert.equal(vm.runInContext('typeof window', context), 'undefined');
  assert.equal(vm.runInContext('typeof document', context), 'undefined');
  const core = new context.ClerkCore.Clerk(publishableKey);
  let credential = null;
  context.ClerkCore.installMobileCredentialTransport(core, {
    read: async () => credential,
    write: async value => {
      credential = value;
    },
    remove: async () => {
      credential = null;
    },
  });
  const transport = {
    getRedirectUrl: async () => callbackURL,
    open: async url => {
      opened.push(String(url));
      if (transportResult === 'pending')
        return new Promise(resolve => {
          browserResolve = resolve;
        });
      if (transportResult instanceof Error) throw transportResult;
      return { callbackUrl: transportResult || `${callbackURL}?rotating_token_nonce=nonce_native` };
    },
  };
  await core.load({ standardBrowser: false, telemetry: false, __internal_oauthTransport: transport });
  const runtime = new context.ClerkCore.ResourceRuntime({
    roots: () => ({
      ...context.ClerkCore.authenticationRoots(core),
      session: core.session,
      user: core.user,
      organization: core.organization,
    }),
    emit: message => messages.push(JSON.parse(JSON.stringify(message))),
  });
  const initial = runtime.snapshot();
  const name = root === 'signIn' ? 'SignIn' : 'SignUp';
  const run = () =>
    runtime.invoke({
      kind: 'invoke',
      id: 'sso-1',
      target: initial.roots[root],
      operation: `${name}.sso`,
      args: [
        {
          strategy: 'oauth_google',
        },
      ],
    });
  return { core, runtime, run, requests, messages, opened, context, releaseBrowser: result => browserResolve(result) };
}

for (const root of ['signIn', 'signUp']) {
  test(`${root}.sso runs the generated operation on the real future facade without a browser global or implicit finalization`, async () => {
    const f = await fixture(root);
    await f.run();
    const complete = f.messages.at(-1);
    assert.equal(complete.failure, undefined);
    assert.deepEqual(complete.result, { error: null });
    assert.deepEqual(f.opened, [verificationURL]);
    const authRequests = f.requests.filter(r => /sign_ins|sign_ups/.test(r.url));
    assert.equal(authRequests.length, 2);
    const preparation = new URLSearchParams(authRequests[0].body);
    assert.equal(preparation.get('strategy'), 'oauth_google');
    assert.equal(preparation.get('redirect_url'), callbackURL);
    assert.equal(preparation.get('action_complete_redirect_url'), callbackURL);
    assert.equal(new URL(authRequests[1].url).searchParams.get('rotating_token_nonce'), 'nonce_native');
    assert.equal(authRequests[1].headers.authorization, 'test-client-credential');
    assert.equal(new URL(authRequests[1].url).searchParams.get('_is_native'), '1');
    const state = complete.state.resources.find(r => r.handle.id === complete.state.roots[root].id).state;
    assert.equal(state.status, 'complete');
    assert.equal(state.createdSessionId, 'sess_native');
    assert.equal(f.core.session, null);
    assert.equal(
      f.requests.some(r => /sessions.*(touch|tokens)/.test(r.url)),
      false,
    );
    assert.equal(JSON.stringify(complete.state).includes('test-client-credential'), false);
    assert.equal(JSON.stringify(complete.state).includes(verificationURL), false);
  });

  test(`${root}.sso preserves remaining requirements`, async () => {
    const status = root === 'signIn' ? 'needs_second_factor' : 'missing_requirements';
    const f = await fixture(root, undefined, status);
    await f.run();
    const complete = f.messages.at(-1);
    assert.deepEqual(complete.result, { error: null });
    assert.equal(
      complete.state.resources.find(r => r.handle.id === complete.state.roots[root].id).state.status,
      status,
    );
    assert.equal(f.core.session, null);
  });

  test(`${root}.sso returns native cancellation through its error envelope without reconciling or activating`, async () => {
    const f = await fixture(root, Object.assign(new Error('Browser cancelled.'), { code: 'user_cancelled' }));
    await f.run();
    const complete = f.messages.at(-1);
    assert.equal(complete.result.error.code, 'user_cancelled');
    assert.equal(f.requests.filter(r => /sign_ins|sign_ups/.test(r.url)).length, 1);
    assert.equal(f.core.session, null);
  });

  test(`${root}.sso rejects an unrelated callback before sending a nonce`, async () => {
    const f = await fixture(root, 'attacker://other?rotating_token_nonce=wrong');
    await f.run();
    assert.equal(f.messages.at(-1).result.error.code, 'oauth_transport_callback_mismatch');
    assert.equal(f.requests.filter(r => /sign_ins|sign_ups/.test(r.url)).length, 1);
  });
}
