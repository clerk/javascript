import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, deferred, response } from './protocol-fixture.mjs';

const settle = () => new Promise(resolve => setTimeout(resolve, 30));

test('reconnection refreshes resources once and background restoration waits for foreground', async t => {
  const f = await fixture();
  t.after(f.dispose);
  const reads = () => f.requests.filter(r => new URL(r.url).pathname.endsWith('/client')).length;
  const initial = reads();
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(reads(), initial);
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(reads(), initial + 1);
  assert.equal(f.state.roots.session, null);
  f.receive({ kind: 'connectivity', online: true });
  f.receive({ kind: 'lifecycle', state: 'background' });
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(reads(), initial + 1);
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await settle();
  assert.equal(reads(), initial + 2);
  assert.equal(
    f.messages.some(m => m.kind === 'runtimeError'),
    false,
  );
});

test('foreground while offline waits for reconnection and duplicate recovery events share a reload', async t => {
  const gate = deferred();
  let reads = 0;
  const f = await fixture({
    http: async request => {
      if (new URL(request.url).pathname.endsWith('/client') && ++reads > 1) await gate.promise;
    },
  });
  t.after(() => {
    gate.resolve();
    f.dispose();
  });
  f.receive({ kind: 'lifecycle', state: 'background' });
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await settle();
  assert.equal(reads, 1);
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(reads, 2);
  f.receive({ kind: 'lifecycle', state: 'background' });
  f.receive({ kind: 'lifecycle', state: 'foreground' });
  await settle();
  assert.equal(reads, 2);
  gate.resolve();
});

test('invalid connectivity values fail explicitly; disposed owners ignore restoration', async t => {
  const f = await fixture();
  t.after(f.dispose);
  f.receive({ kind: 'connectivity', online: 'false' });
  assert.equal(f.messages.at(-1).failure.code, 'invalid_connectivity_state');
  const before = f.requests.length;
  f.dispose();
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(f.requests.length, before);
});

test('restoration during a failing reload retries after it settles and preserves the owner', async t => {
  const gate = deferred();
  let reads = 0;
  const f = await fixture({
    http: async request => {
      if (new URL(request.url).pathname.endsWith('/client') && ++reads === 2) {
        await gate.promise;
        return response(null, {
          status: 422,
          body: JSON.stringify({ errors: [{ code: 'fixture_failure', message: 'Reload failed' }] }),
        });
      }
    },
  });
  t.after(() => {
    gate.resolve();
    f.dispose();
  });
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'connectivity', online: true });
  await settle();
  assert.equal(reads, 2);
  f.receive({ kind: 'connectivity', online: false });
  f.receive({ kind: 'connectivity', online: true });
  gate.resolve();
  await settle();
  assert.equal(reads, 3);
  assert.equal(
    f.messages.some(m => m.kind === 'lifecycleError'),
    true,
  );
  assert.equal((await f.invoke(f.state.roots.signIn, 'SignIn.reset')).failure, undefined);
  assert.equal(f.state.roots.session, null);
});
