import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const modules = new Set();
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const result = nextResolve(specifier, context);
    modules.add(result.url);
    return result;
  },
});
const { createLoomClient } = await import('../dist/index.js');
const client = createLoomClient({
  scope: { instanceKey: 'controlled', userId: 'user_a', sessionId: 'session_a' },
  transport: { read: async () => [], revoke: async () => {} },
});
assert.deepEqual(await client.fetch(), []);
client.dispose();
hooks.deregister();
assert.equal(
  [...modules].some(url => /(?:react|mosaic|clerk-js)(?:[/@.-]|$)/i.test(url)),
  false,
);
console.log(`Built core: ${modules.size} modules loaded; no React, Mosaic, or ClerkJS runtime.`);
