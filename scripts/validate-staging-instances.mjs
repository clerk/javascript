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
  /\.id$/,
  /^auth_config\.id$/,
  /\.logo_url$/,
  /\.captcha_enabled$/,
  /\.captcha_widget_type$/,
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
  const parts = pk.split('_');
  const encoded = parts.slice(2).join('_');
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  return decoded.replace(/\$$/, '');
}

// ── Environment fetching ─────────────────────────────────────────────────────

async function fetchEnvironment(fapiDomain) {
  const url = `https://${fapiDomain}/v1/environment`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ── Comparison ───────────────────────────────────────────────────────────────

const COMPARED_USER_SETTINGS_FIELDS = ['attributes', 'social', 'sign_in', 'sign_up', 'password_settings'];

/**
 * Recursively compare two values and collect paths where they differ.
 * For arrays of primitives (like strategy lists), stores structured diff info.
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
    const sortedA = JSON.stringify([...a].sort());
    const sortedB = JSON.stringify([...b].sort());
    if (sortedA !== sortedB) {
      // For arrays of primitives, compute added/removed
      const flatA = a.flat(Infinity);
      const flatB = b.flat(Infinity);
      if (flatA.every(v => typeof v !== 'object') && flatB.every(v => typeof v !== 'object')) {
        const setA = new Set(flatA);
        const setB = new Set(flatB);
        const missingOnStaging = [...new Set(flatA.filter(v => !setB.has(v)))];
        const extraOnStaging = [...new Set(flatB.filter(v => !setA.has(v)))];
        mismatches.push({ path, prod: a, staging: b, missingOnStaging, extraOnStaging });
      } else {
        mismatches.push({ path, prod: a, staging: b });
      }
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
      const prodSocial = prodEnv.user_settings?.social ?? {};
      const stagingSocial = stagingEnv.user_settings?.social ?? {};
      const allProviders = new Set([...Object.keys(prodSocial), ...Object.keys(stagingSocial)]);
      for (const provider of allProviders) {
        const prodProvider = prodSocial[provider];
        const stagingProvider = stagingSocial[provider];
        if (!prodProvider?.enabled && !stagingProvider?.enabled) continue;
        mismatches.push(...diffObjects(prodProvider, stagingProvider, `user_settings.social.${provider}`));
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

/**
 * Section display names and the path prefixes they cover.
 */
const SECTIONS = [
  { label: 'Auth Config', prefix: 'auth_config.' },
  { label: 'Organization Settings', prefix: 'organization_settings.' },
  { label: 'Attributes', prefix: 'user_settings.attributes.' },
  { label: 'Social Providers', prefix: 'user_settings.social.' },
  { label: 'Sign In', prefix: 'user_settings.sign_in.' },
  { label: 'Sign Up', prefix: 'user_settings.sign_up.' },
  { label: 'Password Settings', prefix: 'user_settings.password_settings.' },
];

const COL_FIELD = 40;
const COL_VAL = 14;

function pad(str, len) {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function formatScalar(val) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

/**
 * Collapse attribute mismatches: if <attr>.enabled differs, skip the child
 * fields (first_factors, second_factors, verifications, etc.) since the root
 * cause is the enabled flag.
 */
function collapseAttributeMismatches(mismatches) {
  const disabledAttrs = new Set();
  for (const m of mismatches) {
    if (m.path.startsWith('user_settings.attributes.') && m.path.endsWith('.enabled')) {
      disabledAttrs.add(m.path.replace('.enabled', ''));
    }
  }
  return mismatches.filter(m => {
    if (!m.path.startsWith('user_settings.attributes.')) return true;
    // Keep the .enabled entry itself
    if (m.path.endsWith('.enabled')) return true;
    // Drop children of disabled attributes
    const parentAttr = m.path.replace(/\.[^.]+$/, '');
    return !disabledAttrs.has(parentAttr);
  });
}

/**
 * For social providers that are entirely present/missing, collapse to one line.
 */
function collapseSocialMismatches(mismatches) {
  const wholeMissing = new Set();
  for (const m of mismatches) {
    if (m.path.startsWith('user_settings.social.') && !m.path.includes('.', 'user_settings.social.x'.length)) {
      if ((m.prod && !m.staging) || (!m.prod && m.staging)) {
        wholeMissing.add(m.path);
      }
    }
  }
  return mismatches.filter(m => {
    if (!m.path.startsWith('user_settings.social.')) return true;
    // Keep the top-level entry
    const parts = m.path.split('.');
    if (parts.length <= 3) return true;
    // Drop children of wholly missing providers
    const parentPath = parts.slice(0, 3).join('.');
    return !wholeMissing.has(parentPath);
  });
}

function formatMismatch(m, prefix) {
  const field = m.path.slice(prefix.length);

  // Array diff with missing/extra items
  if (m.missingOnStaging || m.extraOnStaging) {
    const parts = [];
    if (m.missingOnStaging?.length) {
      parts.push(`missing on staging: ${m.missingOnStaging.join(', ')}`);
    }
    if (m.extraOnStaging?.length) {
      parts.push(`extra on staging: ${m.extraOnStaging.join(', ')}`);
    }
    return `    ${pad(field, COL_FIELD)} ${parts.join('; ')}`;
  }

  // Social provider entirely present/missing
  if (prefix === 'user_settings.social.' && !field.includes('.')) {
    if (m.prod && !m.staging) {
      return `    ${pad(field, COL_FIELD)} ${pad('present', COL_VAL)} missing`;
    }
    if (!m.prod && m.staging) {
      return `    ${pad(field, COL_FIELD)} ${pad('missing', COL_VAL)} present`;
    }
  }

  const prodVal = formatScalar(m.prod);
  const stagingVal = formatScalar(m.staging);
  return `    ${pad(field, COL_FIELD)} ${pad(prodVal, COL_VAL)} ${stagingVal}`;
}

function printReport(name, mismatches) {
  if (mismatches.length === 0) {
    console.log(`✅ ${name}: matched\n`);
    return;
  }

  console.log(`❌ ${name} (${mismatches.length} mismatch${mismatches.length === 1 ? '' : 'es'})\n`);

  for (const section of SECTIONS) {
    const sectionMismatches = mismatches.filter(m => m.path.startsWith(section.prefix));
    if (sectionMismatches.length === 0) continue;

    console.log(`  ${section.label}`);
    console.log(`    ${pad('', COL_FIELD)} ${pad('prod', COL_VAL)} staging`);

    for (const m of sectionMismatches) {
      console.log(formatMismatch(m, section.prefix));
    }
    console.log();
  }
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
  let fetchFailCount = 0;

  for (const pair of pairs) {
    const prodDomain = parseFapiDomain(pair.prod.pk);
    const stagingDomain = parseFapiDomain(pair.staging.pk);

    let prodEnv, stagingEnv;
    try {
      [prodEnv, stagingEnv] = await Promise.all([fetchEnvironment(prodDomain), fetchEnvironment(stagingDomain)]);
    } catch (err) {
      fetchFailCount++;
      console.log(`⚠️  ${pair.name}: failed to fetch environment`);
      console.log(`   ${err.message}\n`);
      continue;
    }

    let mismatches = compareEnvironments(prodEnv, stagingEnv).filter(m => !isIgnored(m.path));
    mismatches = collapseAttributeMismatches(mismatches);
    mismatches = collapseSocialMismatches(mismatches);

    if (mismatches.length > 0) mismatchCount++;
    printReport(pair.name, mismatches);
  }

  const parts = [];
  if (mismatchCount > 0) parts.push(`${mismatchCount} mismatched`);
  if (fetchFailCount > 0) parts.push(`${fetchFailCount} failed to fetch`);
  const matchedCount = pairs.length - mismatchCount - fetchFailCount;
  if (matchedCount > 0) parts.push(`${matchedCount} matched`);
  console.log(`Summary: ${parts.join(', ')} (${pairs.length} total)`);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(0);
});
