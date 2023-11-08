let webcrypto;
try {
  webcrypto = require('node:crypto').webcrypto;
  if (!webcrypto) {
    webcrypto = global.crypto;
  }
} catch (e) {
  webcrypto = global.crypto;
}

module.exports = webcrypto;
