import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { randomBytes, createHash } from 'node:crypto';
import { fixtures } from './native-fixtures.mjs';
export { sessionFixture, tokenFixture } from './native-fixtures.mjs';

const bundle = fs.readFileSync(new URL('../dist/clerk-core.js', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../../native-bindings/generated/manifest.json', import.meta.url)));
export const publishableKey = `pk_test_${Buffer.from('native-core.clerk.accounts.dev$').toString('base64')}`;
export const callbackUrl = 'clerk-test://sso-callback';
export const deferred = () => {
  let resolve;
  const promise = new Promise(r => {
    resolve = r;
  });
  return { promise, resolve };
};

export async function fixture(options = {}) {
  const messages = [],
    requests = [],
    waits = new Map(),
    jobs = new Map();
  let authRecord = options.authRecord ?? null;
  let credential = options.credential ?? null,
    state,
    sequence = 0;
  let client = structuredClone(options.client ?? fixtures.client);
  const context = vm.createContext({
    __clerkNativeRandom: length => (options.randomBytes?.(length) ?? randomBytes(length)).toString('base64'),
    __clerkNativeEmit: encoded => {
      const message = JSON.parse(encoded);
      messages.push(message);
      if (message.state) state = message.state;
      if (message.kind === 'hostCancel') {
        clearTimeout(jobs.get(message.id));
        jobs.delete(message.id);
        return;
      }
      if (message.kind !== 'hostRequest') {
        if (message.kind === 'runtimeError') {
          for (const pending of waits.values()) pending.resolve(message);
          waits.clear();
        }
        const waiter = waits.get(message.id);
        if (waiter) {
          waits.delete(message.id);
          waiter.resolve(message);
        }
        return;
      }
      if (message.capability === 'timer') {
        jobs.set(
          message.id,
          setTimeout(() => {
            jobs.delete(message.id);
            receive({ kind: 'hostReply', id: message.id, result: null });
          }, message.args.milliseconds),
        );
        return;
      }
      void (async () => {
        try {
          let result;
          if (message.capability === 'storage.read') result = credential;
          else if (message.capability === 'storage.write') {
            credential = message.args.value;
            result = null;
          } else if (message.capability === 'storage.remove') {
            credential = null;
            result = null;
          } else if (message.capability === 'authStorage.read') result = authRecord;
          else if (message.capability === 'authStorage.write') {
            await options.authWrite?.(message.args.value);
            authRecord = message.args.value;
            result = null;
          } else if (message.capability === 'authStorage.remove') {
            authRecord = null;
            result = null;
          } else if (message.capability === 'crypto.sha256') {
            await options.digest?.();
            result = createHash('sha256').update(message.args.value).digest('base64url');
          } else if (message.capability === 'browser')
            result = (await options.browser?.(message.args)) ?? {
              callbackUrl: `${callbackUrl}?rotating_token_nonce=fixture_nonce`,
            };
          else if (message.capability === 'http') {
            const request = message.args;
            requests.push(request);
            const custom = await options.http?.(request, {
              get client() {
                return client;
              },
              set client(value) {
                client = value;
              },
            });
            if (custom) result = custom;
            else {
              const pathname = new URL(request.url).pathname;
              let payload;
              if (pathname.endsWith('/environment')) payload = fixtures.environment;
              else if (pathname.endsWith('/client')) payload = client;
              else
                throw Object.assign(new Error(`Unexpected request: ${request.method} ${pathname}`), {
                  code: 'unexpected_fixture_request',
                });
              result = response(payload);
            }
          } else if (message.capability === 'appleIdentity') result = await options.appleIdentity?.(message.args);
          else if (message.capability === 'googleIdentity') result = await options.googleIdentity?.(message.args);
          else if (message.capability.startsWith('biometrics.')) result = await options.biometrics?.(message);
          else if (message.capability.startsWith('passkeys.')) result = await options.passkeys?.(message);
          else throw Object.assign(new Error('Unsupported fixture capability'), { code: 'capability_unavailable' });
          receive({ kind: 'hostReply', id: message.id, result });
        } catch (error) {
          receive({ kind: 'hostReply', id: message.id, error: { code: error.code || 'fixture_error' } });
        }
      })();
    },
  });
  const receive = message => context.ClerkCore.receive(JSON.stringify(message));
  const send = message => {
    const id = message.id || `t${++sequence}`;
    const waiter = deferred();
    waits.set(id, waiter);
    receive({ ...message, id });
    return waiter.promise;
  };
  vm.runInContext(bundle, context, { timeout: 10000 });
  const ready = await send({
    kind: 'init',
    configuration: {
      publishableKey,
      callbackUrl,
      ...manifest,
      platform: 'ios',
      capabilities: ['http', 'storage', 'random', 'timer', 'browser', ...(options.capabilities || [])],
      ...options.configuration,
    },
  });
  const dispose = () => {
    receive({ kind: 'dispose' });
    for (const job of jobs.values()) clearTimeout(job);
  };
  if (!options.allowFailure) assert.equal(ready.kind, 'ready', JSON.stringify(ready));
  return {
    ready,
    messages,
    requests,
    receive,
    send,
    dispose,
    get state() {
      return state;
    },
    get authRecord() {
      return authRecord;
    },
    get credential() {
      return credential;
    },
    resource(handle) {
      return state.resources.find(r => r.handle.id === handle.id)?.state;
    },
    invoke(target, operation, args = [], id) {
      return send({ kind: 'invoke', target, operation, args, id });
    },
    group(root, name) {
      const reference = state.resources.find(r => r.handle.id === state.roots[root].id).state[name];
      return reference.$ref;
    },
  };
}

export function response(payload, extra = {}) {
  return {
    status: 200,
    headers: { authorization: 'fixture_client_credential' },
    body: JSON.stringify({ response: payload }),
    ...extra,
  };
}
