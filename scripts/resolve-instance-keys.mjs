#!/usr/bin/env node

/**
 * Resolves Clerk pk/sk for a named test instance from a JSON-encoded env var
 * (e.g. INTEGRATION_INSTANCE_KEYS / INTEGRATION_STAGING_INSTANCE_KEYS).
 *
 * Usage:
 *   node scripts/resolve-instance-keys.mjs <SECRET_ENV_VAR> <INSTANCE_NAME>
 *
 * Writes pk and sk as GitHub Actions step outputs to $GITHUB_OUTPUT and masks
 * sk in the runner logs. Exits non-zero with a ::error:: annotation if the
 * env var is missing, malformed, or doesn't contain the requested instance.
 */

import { appendFileSync } from 'node:fs';

const fail = msg => {
  console.error(`::error::${msg}`);
  process.exit(1);
};

const [, , secretVar, instanceName] = process.argv;
if (!secretVar || !instanceName) {
  fail('Usage: resolve-instance-keys.mjs <SECRET_ENV_VAR> <INSTANCE_NAME>');
}

const raw = process.env[secretVar];
if (!raw) fail(`${secretVar} secret is not set`);

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (err) {
  fail(`Failed to parse ${secretVar} as JSON: ${err.message}`);
}

if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
  fail(`Expected ${secretVar} to be a JSON object of instance entries`);
}

const entry = parsed[instanceName];
if (!entry) {
  const available = Object.keys(parsed).sort().join(', ') || '(none)';
  fail(`No entry '${instanceName}' found in ${secretVar}. Available keys: ${available}`);
}

const { pk, sk } = entry;
if (!pk) fail(`Entry '${instanceName}' in ${secretVar} is missing 'pk'`);
if (!sk) fail(`Entry '${instanceName}' in ${secretVar} is missing 'sk'`);

console.log(`::add-mask::${sk}`);

const out = process.env.GITHUB_OUTPUT;
if (out) appendFileSync(out, `pk=${pk}\nsk=${sk}\n`);
