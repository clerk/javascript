import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { fixtures } from './native-fixtures.mjs';
import { deferred, publishableKey, response } from './protocol-fixture.mjs';

const bundle = fs.readFileSync(new URL('../dist/clerk-core-test.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../native-bindings/generated/manifest.json', import.meta.url)));
const tick = () => new Promise(resolve => setImmediate(resolve));

async function fixture(options = {}) {
  const requests = [],
    jobs = new Map();
  let credential = 'existing-expo-credential';
  let resets = 0;
  const context = vm.createContext({
    __clerkNativeRandom: length => randomBytes(length).toString('base64'),
    __clerkNativeEmit(encoded) {
      const message = JSON.parse(encoded);
      if (message.kind === 'hostCancel') {
        clearTimeout(jobs.get(message.id));
        jobs.delete(message.id);
        return;
      }
      if (message.kind !== 'hostRequest') return;
      if (message.capability === 'timer') {
        jobs.set(
          message.id,
          setTimeout(() => {
            jobs.delete(message.id);
            context.ClerkCore.hostReply({ id: message.id, result: null });
          }, message.args.milliseconds),
        );
        return;
      }
      assert.equal(message.capability, 'http');
      requests.push(message.args);
      void (async () => {
        const path = new URL(message.args.url).pathname;
        let result = await options.http?.(message.args);
        if (!result) {
          if (path.endsWith('/environment')) result = response(fixtures.environment);
          else if (path.endsWith('/client')) result = response({ ...fixtures.client, sign_in: fixtures.signIn });
          else if (path.endsWith('/attempt_first_factor'))
            result = response({ ...fixtures.signIn, status: 'needs_second_factor' });
          else throw new Error(`Unexpected request ${path}`);
        }
        context.ClerkCore.hostReply({ id: message.id, result });
      })();
    },
  });
  vm.runInContext(bundle, context, { timeout: 10000 });
  // This is the only Clerk construction. Every projection below attaches to this owner.
  const core = new context.ClerkCore.Clerk(publishableKey);
  const mobile = context.ClerkCore.installMobileCredentialTransport(core, {
    read: async () => credential,
    write: async value => {
      credential = value;
    },
    remove: async () => {
      credential = null;
    },
  });
  const removeHost = await core.__internal_configureNativeHost({
    platform: 'ios',
    callbackUrl: 'test://auth-callback',
    capabilities: [],
    request: async () => {
      throw new Error('Unexpected platform operation');
    },
    cancelAuthentication: () => {
      resets++;
    },
    invalidateCredentials: () => mobile.invalidate(),
  });
  await core.load({ standardBrowser: false, telemetry: false, experimental: { runtimeEnvironment: 'headless' } });
  if (options.reactNativeWindow) context.window = context;
  const attachments = [];
  function attach(configuration = {}) {
    const messages = [],
      waits = new Map();
    let state,
      sequence = 0;
    const bridge = context.ClerkCore.attachResourceCore(core, value => {
      const message = JSON.parse(JSON.stringify(value));
      messages.push(message);
      if (message.state) state = message.state;
      waits.get(message.id)?.resolve(message);
      waits.delete(message.id);
    });
    const send = message => {
      const id = `attached-${++sequence}`;
      const pending = deferred();
      waits.set(id, pending);
      bridge.receive(JSON.stringify({ ...message, id }));
      return pending.promise;
    };
    const ready = send({ kind: 'init', configuration: { ...manifest, publishableKey, ...configuration } });
    const resource = handle => state.resources.find(record => record.handle.id === handle.id)?.state;
    const result = {
      bridge,
      ready,
      messages,
      resource,
      get state() {
        return state;
      },
      group: (root, name) => resource(state.roots[root])[name].$ref,
      invoke: (target, operation, args = []) => send({ kind: 'invoke', target, operation, args }),
    };
    attachments.push(result);
    return result;
  }
  function dispose() {
    removeHost();
    for (const attachment of attachments) attachment.bridge.dispose();
    mobile.dispose();
    context.ClerkCore.receive(JSON.stringify({ kind: 'dispose' }));
    for (const job of jobs.values()) clearTimeout(job);
  }
  return { core, attach, requests, dispose, credential: () => credential, resets: () => resets };
}

test('attached handshake validates the existing owner and bindings without another initialization request', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const count = f.requests.length;
  assert.equal((await f.attach({ publishableKey: 'pk_test_wrong' }).ready).failure.code, 'core_owner_mismatch');
  assert.equal((await f.attach({ contractHash: 'wrong' }).ready).failure.code, 'incompatible_bindings');
  assert.equal((await f.attach().ready).kind, 'ready');
  assert.equal(f.requests.length, count);
});

test('native snapshots tolerate the React Native window without a browser location', async t => {
  const f = await fixture({ reactNativeWindow: true });
  t.after(f.dispose);
  const projection = f.attach();
  assert.equal((await projection.ready).kind, 'ready');
  const emailLink = projection.group('signIn', 'emailLink');
  assert.equal(projection.resource(emailLink).verification, null);
});

test('native calls mutate the existing JavaScript facade and direct JavaScript reset invalidates its native group', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const a = f.attach();
  await a.ready;
  const existing = f.core.client.signIn.__internal_future;
  const group = a.group('signIn', 'emailCode');
  const result = await a.invoke(group, 'SignInEmailCode.verifyCode', [{ code: '123456' }]);
  assert.deepEqual(result.result, { error: null });
  assert.equal(existing.status, 'needs_second_factor');
  assert.equal(f.core.client.signIn.__internal_future, existing);
  assert.equal(a.resource(a.state.roots.signIn).status, existing.status);
  assert.equal(f.core.session, null);
  const requests = f.requests.length;
  await existing.reset();
  await tick();
  assert.equal(a.resource(a.state.roots.signIn).status, 'needs_identifier');
  assert.equal(
    (await a.invoke(group, 'SignInEmailCode.verifyCode', [{ code: '123456' }])).failure.code,
    'stale_resource',
  );
  assert.equal(f.requests.length, requests);
  assert.equal(f.resets(), 1);
});

test('direct JavaScript verification publishes through the same native projection', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const a = f.attach();
  await a.ready;
  const result = await f.core.client.signIn.__internal_future.emailCode.verifyCode({ code: '123456' });
  assert.equal(result.error, null);
  await tick();
  assert.equal(a.resource(a.state.roots.signIn).status, 'needs_second_factor');
});

test('JavaScript reset fences an in-flight native verification and its credential write', async t => {
  const started = deferred(),
    reply = deferred();
  const f = await fixture({
    http: async request => {
      if (!request.url.includes('/attempt_first_factor')) return;
      started.resolve();
      return reply.promise;
    },
  });
  t.after(f.dispose);
  const a = f.attach();
  await a.ready;
  const pending = a.invoke(a.group('signIn', 'emailCode'), 'SignInEmailCode.verifyCode', [{ code: '123456' }]);
  await started.promise;
  const credential = f.credential();
  await f.core.client.signIn.__internal_future.reset();
  await tick();
  assert.equal(a.resource(a.state.roots.signIn).status, 'needs_identifier');
  reply.resolve(
    response({ ...fixtures.signIn, status: 'complete' }, { headers: { authorization: 'late-credential' } }),
  );
  assert.equal((await pending).failure.code, 'stale_operation');
  assert.equal(a.resource(a.state.roots.signIn).status, 'needs_identifier');
  assert.equal(f.credential(), credential);
});

test('JavaScript sign-out fences native authentication even before a session exists', async t => {
  const started = deferred(),
    reply = deferred();
  const f = await fixture({
    http: async request => {
      if (!request.url.includes('/attempt_first_factor')) return;
      started.resolve();
      return reply.promise;
    },
  });
  t.after(f.dispose);
  const a = f.attach();
  await a.ready;
  const pending = a.invoke(a.group('signIn', 'emailCode'), 'SignInEmailCode.verifyCode', [{ code: '123456' }]);
  await started.promise;
  const credential = f.credential();
  await f.core.signOut(() => undefined);
  reply.resolve(
    response({ ...fixtures.signIn, status: 'complete' }, { headers: { authorization: 'late-signout-credential' } }),
  );
  assert.equal((await pending).failure.code, 'stale_operation');
  assert.equal(f.resets(), 1);
  assert.equal(f.core.session, null);
  assert.equal(f.credential(), credential);
});

test('detaching native views preserves pending JavaScript work and reattaches without a new client', async t => {
  const started = deferred(),
    reply = deferred();
  const f = await fixture({
    http: async request => {
      if (!request.url.includes('/attempt_first_factor')) return;
      started.resolve();
      return reply.promise;
    },
  });
  t.after(f.dispose);
  const a = f.attach();
  await a.ready;
  const oldGroup = a.group('signIn', 'emailCode');
  void a.invoke(oldGroup, 'SignInEmailCode.verifyCode', [{ code: '123456' }]);
  await started.promise;
  a.bridge.dispose();
  const messageCount = a.messages.length;
  reply.resolve(response({ ...fixtures.signIn, status: 'needs_second_factor' }));
  await tick();
  await tick();
  assert.equal(f.core.client.signIn.__internal_future.status, 'needs_second_factor');
  assert.equal(a.messages.length, messageCount);
  const requestCount = f.requests.length;
  const b = f.attach();
  await b.ready;
  assert.equal(b.resource(b.state.roots.signIn).status, 'needs_second_factor');
  assert.equal(f.requests.length, requestCount);
  assert.equal(
    (await b.invoke(oldGroup, 'SignInEmailCode.verifyCode', [{ code: '123456' }])).failure.code,
    'stale_resource',
  );
  assert.equal(f.requests.length, requestCount);
});

test('native reset preserves its own completion and rejects references from another projection', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const a = f.attach(),
    b = f.attach();
  await Promise.all([a.ready, b.ready]);
  const group = a.group('signIn', 'emailCode');
  assert.equal(
    (await b.invoke(group, 'SignInEmailCode.verifyCode', [{ code: '123456' }])).failure.code,
    'stale_resource',
  );
  const result = await a.invoke(a.state.roots.signIn, 'SignIn.reset');
  assert.deepEqual(result.result, { error: null });
  assert.equal(a.resource(a.state.roots.signIn).status, 'needs_identifier');
  await tick();
  assert.equal(b.resource(b.state.roots.signIn).status, 'needs_identifier');
});

test('an OS host attaches after load and preserves an application passkey adapter', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const count = f.requests.length;
  const calls = [];
  const customCredential = async () => ({ publicKeyCredential: null, error: new Error('application passkey adapter') });
  f.core.__internal_createPublicCredentials = customCredential;
  const remove = await f.core.__internal_configureNativeHost({
    platform: 'ios',
    callbackUrl: 'application://auth',
    capabilities: ['browser', 'passkeys'],
    request: async (capability, args) => {
      calls.push({ capability, args });
      return { callbackUrl: 'application://auth?rotating_token_nonce=value' };
    },
    cancelAuthentication() {},
    invalidateCredentials: async () => {},
  });
  assert.equal(f.requests.length, count);
  assert.equal(f.core.__internal_createPublicCredentials, customCredential);
  assert.equal(f.core.__internal_isWebAuthnSupported(), true);
  assert.equal(await f.core.__internal_oauthTransport.getRedirectUrl(), 'application://auth');
  const transport = f.core.__internal_oauthTransport;
  assert.equal(
    (await transport.open(new URL('https://provider.test/auth'))).callbackUrl,
    'application://auth?rotating_token_nonce=value',
  );
  assert.equal(calls[0].capability, 'browser');
  remove();
  await assert.rejects(
    transport.open(new URL('https://provider.test/auth')),
    error => error.code === 'capability_unavailable',
  );
  assert.equal(f.core.__internal_createPublicCredentials, customCredential);
  assert.equal(f.core.loaded, true);
  assert.equal(f.requests.length, count);
});
