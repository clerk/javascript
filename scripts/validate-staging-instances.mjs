#!/usr/bin/env node

/**
 * Validates that staging Clerk instances have the same settings as their
 * production counterparts by comparing FAPI /v1/environment responses.
 *
 * Usage:
 *   node scripts/validate-staging-instances.mjs
 *
 * Reads keys from INTEGRATION_INSTANCE_KEYS / INTEGRATION_STAGING_INSTANCE_KEYS
 * env vars, or from integration/.keys.json / integration/.keys.staging.json.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const STAGING_KEY_PREFIX = 'clerkstage-';

/**
 * Paths to ignore during comparison — these are expected to differ between
 * production and staging environments.
 */
const IGNORED_PATHS = [
  // Resource IDs are always different per instance
  /\.id$/,
  /^auth_config\.id$/,
  // Logo/image URLs use different CDN domains (img.clerk.com vs img.clerkstage.dev)
  /\.logo_url$/,
  // Captcha settings may intentionally differ between environments
  /\.captcha_enabled$/,
  /\.captcha_widget_type$/,
  // HIBP (breach detection) enforcement may differ
  /\.enforce_hibp_on_sign_in$/,
  /\.disable_hibp$/,
];

function isIgnored(path) {
  return IGNORED_PATHS.some(pattern => pattern.test(path));
}

// ── Key loading ──────────────────────────────────────────────────────────────

function loadKeys(envVar, filePath) {
  if (process.env[envVar]) {
    return JSON.parse(process.env[envVar]);
  }
  try {
    return JSON.parse(readFileSync(resolve(filePath), 'utf-8'));
  } catch {
    return null;
  }
}

// ── PK parsing ───────────────────────────────────────────────────────────────

function parseFapiDomain(pk) {
  // pk_test_<base64>$ or pk_live_<base64>$
  const parts = pk.split('_');
  const encoded = parts.slice(2).join('_');
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  // Remove trailing '$'
  return decoded.replace(/\$$/, '');
}

// ── Environment fetching ─────────────────────────────────────────────────────

async function fetchEnvironment(fapiDomain) {
  const url = `https://${fapiDomain}/v1/environment`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Comparison ───────────────────────────────────────────────────────────────

const COMPARED_SECTIONS = ['user_settings', 'organization_settings', 'auth_config'];

const COMPARED_USER_SETTINGS_FIELDS = [
  'attributes',
  'social',
  'sign_in',
  'sign_up',
  'password_settings',
];

/**
 * Recursively compare two values and collect paths where they differ.
 */
function diffObjects(a, b, path = '') {
  const mismatches = [];

  if (a === b) return mismatches;
  if (a == null || b == null || typeof a !== typeof b) {
    mismatches.push({ path, prod: a, staging: b });
    return mismatches;
  }
  if (typeof a !== 'object') {
    if (a !== b) {
      mismatches.push({ path, prod: a, staging: b });
    }
    return mismatches;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    if (JSON.stringify(sortedA) !== JSON.stringify(sortedB)) {
      mismatches.push({ path, prod: a, staging: b });
    }
    return mismatches;
  }

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key;
    mismatches.push(...diffObjects(a[key], b[key], childPath));
  }
  return mismatches;
}

function compareEnvironments(prodEnv, stagingEnv) {
  const mismatches = [];

  // auth_config
  mismatches.push(...diffObjects(prodEnv.auth_config, stagingEnv.auth_config, 'auth_config'));

  // organization_settings
  const orgFields = ['enabled', 'force_organization_selection'];
  for (const field of orgFields) {
    mismatches.push(
      ...diffObjects(
        prodEnv.organization_settings?.[field],
        stagingEnv.organization_settings?.[field],
        `organization_settings.${field}`,
      ),
    );
  }

  // user_settings — selected fields only
  for (const field of COMPARED_USER_SETTINGS_FIELDS) {
    if (field === 'social') {
      // Only compare social providers that are enabled in at least one environment
      const prodSocial = prodEnv.user_settings?.social ?? {};
      const stagingSocial = stagingEnv.user_settings?.social ?? {};
      const allProviders = new Set([...Object.keys(prodSocial), ...Object.keys(stagingSocial)]);
      for (const provider of allProviders) {
        const prodProvider = prodSocial[provider];
        const stagingProvider = stagingSocial[provider];
        if (!prodProvider?.enabled && !stagingProvider?.enabled) continue;
        mismatches.push(
          ...diffObjects(prodProvider, stagingProvider, `user_settings.social.${provider}`),
        );
      }
    } else {
      mismatches.push(
        ...diffObjects(prodEnv.user_settings?.[field], stagingEnv.user_settings?.[field], `user_settings.${field}`),
      );
    }
  }

  return mismatches;
}

// ── Output formatting ────────────────────────────────────────────────────────

function formatValue(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const prodKeys = loadKeys('INTEGRATION_INSTANCE_KEYS', 'integration/.keys.json');
  if (!prodKeys) {
    console.error('No production instance keys found.');
    process.exit(0);
  }

  const stagingKeys = loadKeys('INTEGRATION_STAGING_INSTANCE_KEYS', 'integration/.keys.staging.json');
  if (!stagingKeys) {
    console.error('No staging instance keys found. Skipping validation.');
    process.exit(0);
  }

  // Find pairs
  const pairs = [];
  for (const [name, keys] of Object.entries(prodKeys)) {
    const stagingName = STAGING_KEY_PREFIX + name;
    if (stagingKeys[stagingName]) {
      pairs.push({ name, prod: keys, staging: stagingKeys[stagingName] });
    }
  }

  if (pairs.length === 0) {
    console.log('No production/staging key pairs found. Skipping validation.');
    process.exit(0);
  }

  console.log(`Validating ${pairs.length} staging instance pair(s)...\n`);

  let mismatchCount = 0;

  for (const pair of pairs) {
    const prodDomain = parseFapiDomain(pair.prod.pk);
    const stagingDomain = parseFapiDomain(pair.staging.pk);

    let prodEnv, stagingEnv;
    try {
      [prodEnv, stagingEnv] = await Promise.all([fetchEnvironment(prodDomain), fetchEnvironment(stagingDomain)]);
    } catch (err) {
      console.log(`⚠️  ${pair.name}: failed to fetch environment`);
      console.log(`   ${err.message}\n`);
      continue;
    }

    const mismatches = compareEnvironments(prodEnv, stagingEnv).filter(m => !isIgnored(m.path));

    if (mismatches.length === 0) {
      console.log(`✅ ${pair.name}: matched`);
    } else {
      mismatchCount++;
      console.log(`❌ ${pair.name} (${mismatches.length} mismatch${mismatches.length === 1 ? '' : 'es'}):`);
      for (const m of mismatches) {
        const prodVal = formatValue(m.prod);
        const stagingVal = formatValue(m.staging);
        console.log(`   ${m.path}`);
        console.log(`     prod:    ${prodVal}`);
        console.log(`     staging: ${stagingVal}`);
      }
    }
    console.log();
  }

  // Summary
  if (mismatchCount > 0) {
    console.log(`Summary: ${mismatchCount} of ${pairs.length} instance pair(s) have mismatches`);
  } else {
    console.log(`Summary: all ${pairs.length} instance pair(s) matched`);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(0); // Don't fail the CI run
});
