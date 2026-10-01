import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const script = new URL('./add-instance-env.mjs', import.meta.url);
const keys = 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic\nCLERK_SECRET_KEY=sk_test_synthetic\n';

function fixture(t, existing = '') {
  const dir = mkdtempSync(join(tmpdir(), 'mosaic-env-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'instance.env');
  const target = join(dir, '.env.local');
  writeFileSync(source, keys);
  writeFileSync(target, existing);
  return { source, target };
}

function run(source, target, id = 'app_dev', description = 'User button, development, password sign-in') {
  return spawnSync(process.execPath, [script.pathname, source, target, '--id', id, '--description', description], {
    encoding: 'utf8',
  });
}

test('adds a described inactive configuration while preserving active settings exactly', t => {
  const before = 'OTHER=one\r\nNEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_active\r\nCLERK_SECRET_KEY=sk_test_active';
  const { source, target } = fixture(t, before);

  const result = run(source, target);

  assert.equal(result.status, 0);
  assert.equal(
    readFileSync(target, 'utf8'),
    `${before}\n# mosaic-env: app_dev\n# User button, development, password sign-in\n# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic\n# CLERK_SECRET_KEY=sk_test_synthetic\n`,
  );
  assert.match(result.stdout, /app_dev.*added/);
  assert.doesNotMatch(result.stdout + result.stderr, /pk_test_synthetic|sk_test_synthetic/);
});

test('creates a private env file containing only the inactive block', t => {
  const { source, target } = fixture(t);
  rmSync(target);

  const result = run(source, target);

  assert.equal(result.status, 0);
  assert.equal(
    readFileSync(target, 'utf8'),
    '# mosaic-env: app_dev\n# User button, development, password sign-in\n# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic\n# CLERK_SECRET_KEY=sk_test_synthetic\n',
  );
  assert.equal(statSync(target).mode & 0o777, 0o600);
});

test('uses the Swingset env path by default and preserves existing bytes', t => {
  const dir = mkdtempSync(join(tmpdir(), 'mosaic-env-default-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'instance.env');
  const targetDir = join(dir, 'packages', 'swingset');
  const target = join(targetDir, '.env.local');
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(source, keys);
  const before = Buffer.from([0x41, 0x3d, 0xff, 0x0d, 0x0a]);
  writeFileSync(target, before);

  const result = spawnSync(
    process.execPath,
    [script.pathname, source, '--id', 'app_dev', '--description', 'User button, development'],
    {
      cwd: dir,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0);
  assert.deepEqual(readFileSync(target).subarray(0, before.length), before);
  assert.match(readFileSync(target, 'utf8'), /# mosaic-env: app_dev/);
});

test('keeps multiple configurations and treats a manually activated block as already present', t => {
  const { source, target } = fixture(t, 'OTHER=one\n');
  assert.equal(run(source, target).status, 0);
  writeFileSync(source, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_second\nCLERK_SECRET_KEY=sk_test_second\n');
  assert.equal(run(source, target, 'app_preview', 'User button, preview, social sign-in').status, 0);
  const withBoth = readFileSync(target, 'utf8');
  assert.equal(withBoth.match(/^# mosaic-env: /gm)?.length, 2);

  const repeat = run(source, target);
  assert.equal(repeat.status, 0);
  assert.match(repeat.stdout, /app_dev.*already present/);
  assert.equal(readFileSync(target, 'utf8'), withBoth);

  writeFileSync(
    target,
    withBoth.replace(
      '# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic',
    ),
  );
  const manuallyActivated = readFileSync(target, 'utf8');
  assert.equal(run(source, target).status, 0);
  assert.equal(readFileSync(target, 'utf8'), manuallyActivated);
});

test('rejects invalid metadata without changing the target', t => {
  const { source, target } = fixture(t, 'KEEP=one\n');
  for (const [id, description] of [
    ['bad id', 'Valid description'],
    ['app_dev', ''],
    ['app_dev', 'first line\nsecond line'],
  ]) {
    const result = run(source, target, id, description);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(target, 'utf8'), 'KEEP=one\n');
    assert.doesNotMatch(result.stdout + result.stderr, /pk_test_synthetic|sk_test_synthetic/);
  }
});

test('rejects missing and multiline keys without changing the target', t => {
  const { source, target } = fixture(t, 'KEEP=one\n');
  for (const invalid of [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic\n',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_synthetic\nsecond line"\nCLERK_SECRET_KEY=sk_test_synthetic\n',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_synthetic\nCLERK_SECRET_KEY="sk_test_synthetic\nsecond line"\n',
  ]) {
    writeFileSync(source, invalid);
    const result = run(source, target);
    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(target, 'utf8'), 'KEEP=one\n');
    assert.doesNotMatch(result.stdout + result.stderr, /pk_test_synthetic|sk_test_synthetic/);
  }
});
