import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createTempFixture, getFixturePath } from '../helpers/create-fixture.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// CLI uses JSX which requires babel transpilation - use built dist version
const CLI_PATH = path.resolve(__dirname, '../../../dist/cli.js');

function runCli(args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => {
      stdout += data.toString();
    });

    child.stderr.on('data', data => {
      stderr += data.toString();
    });

    // Send input if provided (for interactive prompts)
    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    }

    // Set timeout to kill the process
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ stdout, stderr, exitCode: null, timedOut: true });
    }, options.timeout || 10000);

    child.on('close', exitCode => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode, timedOut: false });
    });

    child.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

describe('CLI Integration', () => {
  describe('--help flag', () => {
    it('displays help text', async () => {
      const result = await runCli(['--help']);

      expect(result.stdout).toContain('Usage');
      expect(result.stdout).toContain('npx @clerk/upgrade');
      expect(result.stdout).toContain('--sdk');
      expect(result.stdout).toContain('--dir');
      expect(result.stdout).toContain('--dry-run');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('--version flag', () => {
    it('displays version', async () => {
      const result = await runCli(['--version']);

      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('SDK Detection', () => {
    it('detects nextjs SDK from project directory', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      // Combine stdout and stderr for full output
      const output = result.stdout + result.stderr;
      expect(output).toContain('@clerk/nextjs');
      expect(output).toContain('Dry run');
    });

    it('detects nextjs v7 as already upgraded', async () => {
      const dir = getFixturePath('nextjs-v7');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/nextjs');
      expect(result.stdout).toContain('already on the latest');
    });

    it('errors when SDK not detected and not provided in non-interactive mode', async () => {
      const dir = getFixturePath('no-clerk');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 5000 });

      // Error messages go to stderr via console.error
      const output = result.stdout + result.stderr;
      expect(output).toContain('Could not detect Clerk SDK');
      expect(output).toContain('--sdk');
      expect(result.exitCode).toBe(1);
    });

    it('works with explicit --sdk flag when SDK cannot be detected', async () => {
      const dir = getFixturePath('no-clerk');
      const result = await runCli(['--dir', dir, '--sdk', 'nextjs', '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/nextjs');
    });
  });

  describe('--sdk flag', () => {
    it('accepts explicit SDK specification', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--sdk', 'nextjs', '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/nextjs');
    });

    it('accepts @clerk/ prefixed SDK name', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--sdk', '@clerk/nextjs', '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/nextjs');
    });
  });

  describe('--dry-run flag', () => {
    let fixture;

    beforeEach(() => {
      fixture = createTempFixture('nextjs-v6');
    });

    afterEach(() => {
      fixture?.cleanup();
    });

    it('shows what would be done without making changes', async () => {
      const result = await runCli(['--dir', fixture.path, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('Dry run');
      expect(result.stdout).toContain('Would upgrade');
    });

    it('does not modify package.json in dry-run mode', async () => {
      const fs = await import('node:fs');
      const pkgBefore = fs.readFileSync(path.join(fixture.path, 'package.json'), 'utf8');

      await runCli(['--dir', fixture.path, '--dry-run'], { timeout: 15000 });

      const pkgAfter = fs.readFileSync(path.join(fixture.path, 'package.json'), 'utf8');
      expect(pkgAfter).toBe(pkgBefore);
    });
  });

  describe('Version Display', () => {
    it('shows current version in output', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toMatch(/v6|version.*6/i);
    });

    it('shows upgrade path in output', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toMatch(/v6.*v7|6.*→.*7/);
    });
  });

  describe('Package Manager Detection', () => {
    it('detects pnpm from fixture', async () => {
      const dir = getFixturePath('nextjs-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('pnpm');
    });

    it('detects yarn from fixture', async () => {
      const dir = getFixturePath('react-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toMatch(/yarn/i);
    });

    it('detects npm from fixture', async () => {
      const dir = getFixturePath('expo-old-package');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toMatch(/npm/i);
    });
  });

  describe('Legacy Package Names', () => {
    it('handles @clerk/clerk-react legacy package', async () => {
      const dir = getFixturePath('react-v6');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/react');
    });

    it('handles @clerk/clerk-expo legacy package', async () => {
      const dir = getFixturePath('expo-old-package');
      const result = await runCli(['--dir', dir, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('@clerk/expo');
    });
  });

  describe('Codemods', () => {
    let fixture;

    beforeEach(() => {
      fixture = createTempFixture('nextjs-v6');
    });

    afterEach(() => {
      fixture?.cleanup();
    });

    it('lists codemods that would run in dry-run mode', async () => {
      const result = await runCli(['--dir', fixture.path, '--dry-run'], { timeout: 15000 });

      expect(result.stdout).toContain('codemod');
    });
  });
});
