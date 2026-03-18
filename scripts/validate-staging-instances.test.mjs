import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, readFileSync: vi.fn(actual.readFileSync) };
});

import {
  collapseAttributeMismatches,
  collapseSocialMismatches,
  diffObjects,
  fetchEnvironment,
  loadKeys,
  main,
  parseFapiDomain,
} from './validate-staging-instances.mjs';

// ── loadKeys ────────────────────────────────────────────────────────────────

describe('loadKeys', () => {
  const ENV_VAR = 'TEST_INSTANCE_KEYS';

  afterEach(() => {
    delete process.env[ENV_VAR];
  });

  it('parses valid JSON from env var', () => {
    process.env[ENV_VAR] = JSON.stringify({
      foo: { pk: 'pk_test_abc', sk: 'sk_test_abc' },
      bar: { pk: 'pk_test_def' },
    });
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toEqual({
      foo: { pk: 'pk_test_abc', sk: 'sk_test_abc' },
      bar: { pk: 'pk_test_def' },
    });
    expect(errors).toEqual([]);
  });

  it('returns error for malformed JSON in env var', () => {
    process.env[ENV_VAR] = '{not valid json';
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Failed to parse TEST_INSTANCE_KEYS/);
  });

  it('returns error when env var is a JSON array', () => {
    process.env[ENV_VAR] = '["a","b"]';
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Expected a JSON object/);
  });

  it('returns error when env var is a JSON string', () => {
    process.env[ENV_VAR] = '"just a string"';
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/Expected a JSON object/);
  });

  it('reports entries with missing pk', () => {
    process.env[ENV_VAR] = JSON.stringify({
      good: { pk: 'pk_test_abc' },
      bad: { sk: 'sk_only' },
      worse: 'not_an_object',
    });
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toEqual({ good: { pk: 'pk_test_abc' } });
    expect(errors).toHaveLength(2);
    expect(errors).toEqual(
      expect.arrayContaining([expect.stringContaining('"bad"'), expect.stringContaining('"worse"')]),
    );
  });

  it('returns null keys when all entries have invalid pk', () => {
    process.env[ENV_VAR] = JSON.stringify({
      a: { sk: 'no_pk' },
      b: 42,
    });
    const { keys, errors } = loadKeys(ENV_VAR, 'nonexistent.json');
    expect(keys).toBeNull();
    expect(errors).toHaveLength(2);
  });

  it('returns null keys with empty errors when file does not exist and no env var', () => {
    const { keys, errors } = loadKeys('NONEXISTENT_ENV_VAR', '/tmp/does-not-exist-12345.json');
    expect(keys).toBeNull();
    expect(errors).toEqual([]);
  });
});

// ── parseFapiDomain ─────────────────────────────────────────────────────────

describe('parseFapiDomain', () => {
  it('decodes a standard pk to its FAPI domain', () => {
    const domain = 'clerk.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;
    expect(parseFapiDomain(pk)).toBe(domain);
  });

  it('decodes a staging pk', () => {
    const domain = 'clerk.staging.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_live_${encoded}`;
    expect(parseFapiDomain(pk)).toBe(domain);
  });

  it('handles domains without trailing $', () => {
    const domain = 'nodollar.example.com';
    const encoded = Buffer.from(domain).toString('base64');
    const pk = `pk_test_${encoded}`;
    expect(parseFapiDomain(pk)).toBe(domain);
  });

  it('handles base64 with underscores in encoded part', () => {
    // base64 can contain + and / but we use standard base64 here
    const domain = 'special.clerk.dev';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;
    expect(parseFapiDomain(pk)).toBe(domain);
  });
});

// ── diffObjects ─────────────────────────────────────────────────────────────

describe('diffObjects', () => {
  it('returns empty for identical objects', () => {
    const obj = { a: 1, b: { c: 'hello' } };
    expect(diffObjects(obj, obj)).toEqual([]);
  });

  it('returns empty for deeply equal objects', () => {
    expect(diffObjects({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] })).toEqual([]);
  });

  it('detects scalar mismatch', () => {
    const result = diffObjects({ a: 1 }, { a: 2 });
    expect(result).toEqual([{ path: 'a', prod: 1, staging: 2 }]);
  });

  it('detects type mismatch (string vs number)', () => {
    const result = diffObjects({ a: '1' }, { a: 1 });
    expect(result).toEqual([{ path: 'a', prod: '1', staging: 1 }]);
  });

  it('detects null vs value mismatch', () => {
    const result = diffObjects({ a: null }, { a: 'hello' });
    expect(result).toEqual([{ path: 'a', prod: null, staging: 'hello' }]);
  });

  it('detects undefined vs value mismatch', () => {
    const result = diffObjects({ a: 1 }, {});
    expect(result).toEqual([{ path: 'a', prod: 1, staging: undefined }]);
  });

  it('treats undefined and false as equivalent', () => {
    expect(diffObjects({ a: undefined }, { a: false })).toEqual([]);
    expect(diffObjects({ a: false }, { a: undefined })).toEqual([]);
    expect(diffObjects({ a: null }, { a: false })).toEqual([]);
    expect(diffObjects({ a: 0 }, { a: false })).toEqual([]);
  });

  it('detects nested mismatches with correct paths', () => {
    const result = diffObjects({ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } });
    expect(result).toEqual([{ path: 'a.b.c', prod: 1, staging: 2 }]);
  });

  it('detects array mismatches with missingOnStaging/extraOnStaging', () => {
    const result = diffObjects({ arr: ['a', 'b', 'c'] }, { arr: ['b', 'c', 'd'] });
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('arr');
    expect(result[0].missingOnStaging).toEqual(['a']);
    expect(result[0].extraOnStaging).toEqual(['d']);
  });

  it('treats arrays with same elements in different order as equal', () => {
    expect(diffObjects({ arr: [1, 2, 3] }, { arr: [3, 1, 2] })).toEqual([]);
  });

  it('handles arrays of objects (non-primitive) without missingOnStaging', () => {
    const a = { arr: [{ id: 1 }] };
    const b = { arr: [{ id: 2 }] };
    const result = diffObjects(a, b);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('arr');
    // Non-primitive arrays don't get missingOnStaging/extraOnStaging
    expect(result[0].missingOnStaging).toBeUndefined();
    expect(result[0].extraOnStaging).toBeUndefined();
  });

  it('uses root path when provided', () => {
    const result = diffObjects({ x: 1 }, { x: 2 }, 'root');
    expect(result).toEqual([{ path: 'root.x', prod: 1, staging: 2 }]);
  });

  it('detects keys present only in one side', () => {
    const a = { shared: 1, onlyProd: 'yes' };
    const b = { shared: 1, onlyStaging: 'yes' };
    const result = diffObjects(a, b);
    expect(result).toEqual(
      expect.arrayContaining([
        { path: 'onlyProd', prod: 'yes', staging: undefined },
        { path: 'onlyStaging', prod: undefined, staging: 'yes' },
      ]),
    );
  });

  it('returns empty for two identical primitive values at root', () => {
    expect(diffObjects(42, 42)).toEqual([]);
  });

  it('detects mismatch for two different primitive values at root', () => {
    expect(diffObjects(true, false)).toEqual([{ path: '', prod: true, staging: false }]);
  });
});

// ── collapseAttributeMismatches ─────────────────────────────────────────────

describe('collapseAttributeMismatches', () => {
  it('collapses child diffs when .enabled differs', () => {
    const mismatches = [
      { path: 'user_settings.attributes.phone_number.enabled', prod: true, staging: false },
      { path: 'user_settings.attributes.phone_number.first_factors', prod: ['phone_code'], staging: [] },
      { path: 'user_settings.attributes.phone_number.verifications', prod: ['phone_code'], staging: [] },
    ];
    const result = collapseAttributeMismatches(mismatches);
    expect(result).toEqual([
      { path: 'user_settings.attributes.phone_number.enabled', prod: true, staging: false },
    ]);
  });

  it('keeps child diffs when .enabled does NOT differ', () => {
    const mismatches = [
      { path: 'user_settings.attributes.email.first_factors', prod: ['email_code'], staging: ['email_link'] },
    ];
    const result = collapseAttributeMismatches(mismatches);
    expect(result).toEqual(mismatches);
  });

  it('does not collapse non-attribute mismatches', () => {
    const mismatches = [
      { path: 'auth_config.single_session_mode', prod: true, staging: false },
      { path: 'user_settings.attributes.username.enabled', prod: true, staging: false },
      { path: 'user_settings.attributes.username.required', prod: true, staging: false },
    ];
    const result = collapseAttributeMismatches(mismatches);
    expect(result).toEqual([
      { path: 'auth_config.single_session_mode', prod: true, staging: false },
      { path: 'user_settings.attributes.username.enabled', prod: true, staging: false },
    ]);
  });

  it('returns empty array for empty input', () => {
    expect(collapseAttributeMismatches([])).toEqual([]);
  });

  it('collapses multiple disabled attributes independently', () => {
    const mismatches = [
      { path: 'user_settings.attributes.phone_number.enabled', prod: true, staging: false },
      { path: 'user_settings.attributes.phone_number.verifications', prod: ['a'], staging: [] },
      { path: 'user_settings.attributes.username.enabled', prod: false, staging: true },
      { path: 'user_settings.attributes.username.required', prod: false, staging: true },
      { path: 'user_settings.attributes.email.first_factors', prod: ['x'], staging: ['y'] },
    ];
    const result = collapseAttributeMismatches(mismatches);
    expect(result).toEqual([
      { path: 'user_settings.attributes.phone_number.enabled', prod: true, staging: false },
      { path: 'user_settings.attributes.username.enabled', prod: false, staging: true },
      { path: 'user_settings.attributes.email.first_factors', prod: ['x'], staging: ['y'] },
    ]);
  });
});

// ── collapseSocialMismatches ────────────────────────────────────────────────

describe('collapseSocialMismatches', () => {
  it('collapses child diffs for wholly missing social provider', () => {
    const mismatches = [
      { path: 'user_settings.social.google', prod: { enabled: true }, staging: undefined },
      { path: 'user_settings.social.google.enabled', prod: true, staging: undefined },
      { path: 'user_settings.social.google.strategy', prod: 'oauth_google', staging: undefined },
    ];
    const result = collapseSocialMismatches(mismatches);
    expect(result).toEqual([
      { path: 'user_settings.social.google', prod: { enabled: true }, staging: undefined },
    ]);
  });

  it('collapses child diffs for extra social provider on staging', () => {
    const mismatches = [
      { path: 'user_settings.social.github', prod: undefined, staging: { enabled: true } },
      { path: 'user_settings.social.github.enabled', prod: undefined, staging: true },
    ];
    const result = collapseSocialMismatches(mismatches);
    expect(result).toEqual([
      { path: 'user_settings.social.github', prod: undefined, staging: { enabled: true } },
    ]);
  });

  it('keeps child diffs when both prod and staging have the provider', () => {
    const mismatches = [
      { path: 'user_settings.social.facebook', prod: { enabled: true }, staging: { enabled: false } },
      { path: 'user_settings.social.facebook.enabled', prod: true, staging: false },
    ];
    const result = collapseSocialMismatches(mismatches);
    // Both prod and staging are truthy, so not collapsed
    expect(result).toEqual(mismatches);
  });

  it('does not affect non-social mismatches', () => {
    const mismatches = [
      { path: 'auth_config.session_token_ttl', prod: 3600, staging: 7200 },
    ];
    const result = collapseSocialMismatches(mismatches);
    expect(result).toEqual(mismatches);
  });

  it('returns empty array for empty input', () => {
    expect(collapseSocialMismatches([])).toEqual([]);
  });
});

// ── fetchEnvironment ────────────────────────────────────────────────────────

describe('fetchEnvironment', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const mockEnv = { auth_config: { id: '123' } };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockEnv),
    });

    const result = await fetchEnvironment('clerk.example.com');
    expect(result).toEqual(mockEnv);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://clerk.example.com/v1/environment', expect.any(Object));
  });

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchEnvironment('clerk.example.com')).rejects.toThrow(/Failed to fetch.*404/);
  });

  it('throws on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network failure'));

    await expect(fetchEnvironment('clerk.example.com')).rejects.toThrow('Network failure');
  });
});

// ── main orchestration ──────────────────────────────────────────────────────

describe('main', () => {
  let consoleLogs;
  let consoleErrors;
  let exitCode;

  beforeEach(() => {
    consoleLogs = [];
    consoleErrors = [];
    exitCode = undefined;

    vi.spyOn(console, 'log').mockImplementation((...args) => consoleLogs.push(args.join(' ')));
    vi.spyOn(console, 'error').mockImplementation((...args) => consoleErrors.push(args.join(' ')));
    vi.spyOn(process, 'exit').mockImplementation(code => {
      exitCode = code;
      throw new Error(`process.exit(${code})`);
    });

    // Clean up env vars
    delete process.env.INTEGRATION_INSTANCE_KEYS;
    delete process.env.INTEGRATION_STAGING_INSTANCE_KEYS;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exits gracefully when no production keys found', async () => {
    // Mock file reads to throw (simulating missing files)
    readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    await expect(main()).rejects.toThrow('process.exit(0)');
    expect(consoleErrors.some(m => m.includes('No production instance keys found'))).toBe(true);
    expect(exitCode).toBe(0);
  });

  it('exits gracefully when no staging keys found', async () => {
    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk: 'pk_test_abc' },
    });
    // Mock file reads to throw for staging keys file
    readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    await expect(main()).rejects.toThrow('process.exit(0)');
    expect(consoleErrors.some(m => m.includes('No staging instance keys found'))).toBe(true);
    expect(exitCode).toBe(0);
  });

  it('exits when no pairs match', async () => {
    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk: 'pk_test_abc' },
    });
    process.env.INTEGRATION_STAGING_INSTANCE_KEYS = JSON.stringify({
      unrelated: { pk: 'pk_test_def' },
    });

    await expect(main()).rejects.toThrow('process.exit(0)');
    expect(consoleLogs.some(m => m.includes('No production/staging key pairs found'))).toBe(true);
  });

  it('reports matched pairs when environments are identical', async () => {
    const domain = 'clerk.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;

    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk },
    });
    process.env.INTEGRATION_STAGING_INSTANCE_KEYS = JSON.stringify({
      'clerkstage-myapp': { pk },
    });

    const envResponse = {
      auth_config: { session_token_ttl: 3600 },
      organization_settings: { enabled: true },
      user_settings: { attributes: {}, social: {}, sign_in: {}, sign_up: {}, password_settings: {} },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(envResponse),
    });

    await main();
    expect(consoleLogs.some(m => m.includes('myapp: matched'))).toBe(true);
    expect(consoleLogs.some(m => m.includes('1 matched'))).toBe(true);
  });

  it('reports mismatches when environments differ', async () => {
    const domain = 'clerk.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;

    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk },
    });
    process.env.INTEGRATION_STAGING_INSTANCE_KEYS = JSON.stringify({
      'clerkstage-myapp': { pk },
    });

    const prodEnv = {
      auth_config: { single_session_mode: true },
      organization_settings: {},
      user_settings: { attributes: {}, social: {}, sign_in: {}, sign_up: {}, password_settings: {} },
    };
    const stagingEnv = {
      auth_config: { single_session_mode: false },
      organization_settings: {},
      user_settings: { attributes: {}, social: {}, sign_in: {}, sign_up: {}, password_settings: {} },
    };

    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++;
      const env = callCount % 2 === 1 ? prodEnv : stagingEnv;
      return Promise.resolve({ ok: true, json: () => Promise.resolve(env) });
    });

    await main();
    expect(consoleLogs.some(m => m.includes('myapp') && m.includes('mismatch'))).toBe(true);
    expect(consoleLogs.some(m => m.includes('1 mismatched'))).toBe(true);
  });

  it('reports fetch failures in summary', async () => {
    const domain = 'clerk.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;

    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk },
    });
    process.env.INTEGRATION_STAGING_INSTANCE_KEYS = JSON.stringify({
      'clerkstage-myapp': { pk },
    });

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('timeout'));

    await main();
    expect(consoleLogs.some(m => m.includes('failed to fetch environment'))).toBe(true);
    expect(consoleLogs.some(m => m.includes('1 failed to fetch'))).toBe(true);
  });

  it('reports key load errors in summary', async () => {
    const domain = 'clerk.example.com';
    const encoded = Buffer.from(domain + '$').toString('base64');
    const pk = `pk_test_${encoded}`;

    process.env.INTEGRATION_INSTANCE_KEYS = JSON.stringify({
      myapp: { pk },
      bad_entry: 'not_an_object',
    });
    process.env.INTEGRATION_STAGING_INSTANCE_KEYS = JSON.stringify({
      'clerkstage-myapp': { pk },
    });

    const envResponse = {
      auth_config: {},
      organization_settings: {},
      user_settings: { attributes: {}, social: {}, sign_in: {}, sign_up: {}, password_settings: {} },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(envResponse),
    });

    await main();
    expect(consoleErrors.some(m => m.includes('bad_entry'))).toBe(true);
    expect(consoleLogs.some(m => m.includes('1 key load errors'))).toBe(true);
  });
});
