import _crypto from 'node:crypto';

// ref: https://github.com/tc39/proposal-global
const _globalThis = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw new Error('unable to locate global object');
})();

// TODO: Add isomorphic crypto if we end up supporting Node <= 16
// TODO: Do we need conditional exports for this to work across runtimes?
const crypto = _globalThis.crypto || _crypto.webcrypto;

export default crypto;
