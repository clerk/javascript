import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

const runner = resolve('integration/scripts/run-integration.mjs');

function run(setup, fail = '', env = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'run-integration-'));
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  const command = `#!/usr/bin/env node\nconst fs = require('node:fs');\nconst path = require('node:path');\nconst name = path.basename(process.argv[1]);\nconst args = process.argv.slice(2);\nfs.appendFileSync(process.env.COMMAND_LOG, JSON.stringify({ name, args, cwd: process.cwd(), turboForce: process.env.TURBO_FORCE }) + '\\n');\nprocess.exit(process.env.FAIL_COMMAND === name || process.env.FAIL_COMMAND === name + ' ' + args.join(' ') ? 7 : 0);\n`;
  for (const name of ['pnpm', 'pkglab', 'xvfb-run']) {
    const file = join(bin, name);
    writeFileSync(file, command, { mode: 0o755 });
  }
  const output = join(dir, 'output');
  const log = join(dir, 'log');
  const result = spawnSync(process.execPath, [runner, 'pnpm', 'playwright', 'test', '--grep', '@case'], {
    cwd: resolve('.'),
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      COMMAND_LOG: log,
      FAIL_COMMAND: fail,
      GITHUB_OUTPUT: output,
      E2E_CI_SETUP: setup,
      E2E_APP_CLERK_JS_DIR: dir,
      E2E_APP_CLERK_UI_DIR: dir,
      TURBO_ARGS: '--concurrency=2 --output-logs=new-only',
      TURBO_FORCE: 'true',
      ...env,
    },
    encoding: 'utf8',
  });
  const calls = (() => {
    try {
      return readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    } catch {
      return [];
    }
  })();
  const marker = (() => {
    try {
      return readFileSync(output, 'utf8');
    } catch {
      return '';
    }
  })();
  rmSync(dir, { recursive: true, force: true });
  return { result, calls, marker };
}

describe('CI integration runner', () => {
  test('passes local test arguments through unchanged', () => {
    const { result, calls, marker } = run('');
    expect(result.status).toBe(0);
    expect(calls).toMatchObject([{ name: 'pnpm', args: ['playwright', 'test', '--grep', '@case'] }]);
    expect(marker).toBe('');
  });

  test('runs CI setup before Playwright and records that tests started', () => {
    const { result, calls, marker } = run('generic');
    expect(result.status).toBe(0);
    expect(calls.map(({ name, args }) => `${name} ${args.join(' ')}`)).toEqual([
      'pnpm turbo build --concurrency=2 --output-logs=new-only --only',
      'pkglab pub --force',
      'pnpm init',
      'pkglab add @clerk/clerk-js',
      'pnpm init',
      'pkglab add @clerk/ui',
      'pnpm playwright install chromium',
      'pnpm playwright test --grep @case',
    ]);
    expect(calls[0].turboForce).toBe('false');
    expect(marker).toBe('tests-started=true\n');
  });

  test('refuses CI setup without the environment it needs', () => {
    const { result, calls, marker } = run('generic', '', { TURBO_ARGS: '' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('TURBO_ARGS must be set when E2E_CI_SETUP is set');
    expect(calls).toEqual([]);
    expect(marker).toBe('');
  });

  test('does not run tests or set cleanup marker after setup failure', () => {
    const { result, calls, marker } = run('generic', 'pkglab');
    expect(result.status).toBe(7);
    expect(calls.map(call => call.name)).toEqual(['pnpm', 'pkglab']);
    expect(marker).toBe('');
  });

  test('records cleanup marker when Playwright fails', () => {
    const { result, calls, marker } = run('generic', 'pnpm playwright test --grep @case');
    expect(result.status).toBe(7);
    expect(calls.at(-1)).toMatchObject({ name: 'pnpm', args: ['playwright', 'test', '--grep', '@case'] });
    expect(marker).toBe('tests-started=true\n');
  });

  test('runs Astro copy and Electron tests under Xvfb', () => {
    const astro = run('astro');
    expect(astro.calls.some(call => call.args.join(' ') === 'copy:components')).toBe(true);
    const electron = run('electron');
    expect(electron.calls.at(-1)).toMatchObject({
      name: 'xvfb-run',
      args: ['-a', 'pnpm', 'playwright', 'test', '--grep', '@case'],
    });
  });
});
