let webcrypto;
try {
  webcrypto = require('node:crypto').webcrypto;
  if (!webcrypto) {
    webcrypto = new (require('@peculiar/webcrypto').Crypto)();
  }
} catch (e) {
  webcrypto = new (require('@peculiar/webcrypto').Crypto)();
}

module.exports = webcrypto;
