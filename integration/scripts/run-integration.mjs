import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const [command, ...args] = process.argv.slice(2);
const suite = process.env.E2E_CI_SETUP;

if (!command) {
  fail('usage: node integration/scripts/run-integration.mjs <command> [args...]');
}

if (suite) {
  prepareCiRunner(suite);
}

if (suite === 'electron') {
  run('xvfb-run', ['-a', command, ...args]);
} else {
  run(command, args);
}

function prepareCiRunner(suite) {
  const turboArgs = required('TURBO_ARGS').split(/\s+/).filter(Boolean);
  const installs = [
    ['@clerk/clerk-js', join(required('E2E_APP_CLERK_JS_DIR'), 'clerk-js')],
    ['@clerk/ui', join(required('E2E_APP_CLERK_UI_DIR'), 'clerk-ui')],
  ];
  const githubOutput = required('GITHUB_OUTPUT');

  const buildEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('CLERK_')));
  run('pnpm', ['turbo', 'build', ...turboArgs, '--only'], { env: { ...buildEnv, TURBO_FORCE: 'false' } });
  run('pkglab', ['pub', '--force']);
  for (const [packageName, dir] of installs) {
    mkdirSync(dir, { recursive: true });
    run('pnpm', ['init'], { cwd: dir });
    run('pkglab', ['add', packageName], { cwd: dir });
  }
  if (suite === 'astro') {
    run('pnpm', ['copy:components'], { cwd: join(root, 'packages/astro') });
  }
  run('pnpm', ['playwright', 'install', 'chromium']);
  if (suite === 'electron' && spawnSync('sh', ['-c', 'command -v xvfb-run'], { stdio: 'ignore' }).status !== 0) {
    run('sudo', ['apt-get', 'update']);
    run('sudo', ['apt-get', 'install', '-y', 'xvfb']);
  }
  appendFileSync(githubOutput, 'tests-started=true\n');
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    fail(`${name} must be set when E2E_CI_SETUP is set`);
  }
  return value;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) {
    fail(result.error.message);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function fail(message) {
  console.error(`run-integration: ${message}`);
  process.exit(1);
}
