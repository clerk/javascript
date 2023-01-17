let fetch;
try {
  // Pre-node14 runtimes do not support the node: prefix
  // this package uses internally, and they throw.
  // This package is preferred as it does not polyfill the native fetch
  // if it's supported by the runtime
  // https://github.com/node-fetch/node-fetch/issues/1367
  fetch = require('node-fetch-native');
} catch (e) {
  // Otherwise, we will fall back to this lib
  fetch = require('node-fetch');
}

module.exports = fetch;
