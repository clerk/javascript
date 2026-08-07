const assert = require('node:assert/strict');
const { test } = require('node:test');

// Without a built native binary (the default in development and on Linux),
// the loader must degrade gracefully instead of crashing the main process.
const loader = require('../index.js');

const hasNativeBinary = (() => {
  try {
    return loader.isAvailable();
  } catch {
    return false;
  }
})();

test('exposes the full native module surface', () => {
  assert.equal(typeof loader.isAvailable, 'function');
  assert.equal(typeof loader.capabilities, 'function');
  assert.equal(typeof loader.createCredential, 'function');
  assert.equal(typeof loader.getCredential, 'function');
});

test('capabilities never throws', () => {
  const capabilities = loader.capabilities();
  assert.equal(typeof capabilities.platformAuthenticator, 'boolean');
  assert.equal(typeof capabilities.securityKeys, 'boolean');
});

test('credential calls resolve with a not_supported envelope when no binary is present', { skip: hasNativeBinary }, async () => {
  for (const method of ['createCredential', 'getCredential']) {
    const envelope = JSON.parse(await loader[method](Buffer.alloc(8), '{}'));
    assert.equal(envelope.ok, false);
    assert.equal(envelope.error.code, 'not_supported');
  }
});
