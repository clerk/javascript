import { spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const [command, ...args] = process.argv.slice(2);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.E2E_CI_SETUP) {
  run('pnpm', ['turbo', 'build', ...process.env.TURBO_ARGS.split(/\s+/).filter(Boolean), '--only'], {
    env: { ...process.env, TURBO_FORCE: 'false' },
  });
  run('pkglab', ['pub', '--force']);

  for (const [name, packageName, directory] of [
    ['clerk-js', '@clerk/clerk-js', process.env.E2E_APP_CLERK_JS_DIR],
    ['clerk-ui', '@clerk/ui', process.env.E2E_APP_CLERK_UI_DIR],
  ]) {
    const packageDir = join(directory, name);
    mkdirSync(packageDir, { recursive: true });
    run('pnpm', ['init'], { cwd: packageDir });
    run('pkglab', ['add', packageName], { cwd: packageDir });
  }

  if (process.env.E2E_CI_SETUP === 'astro') {
    run('pnpm', ['copy:components'], { cwd: join(root, 'packages/astro') });
  }

  run('pnpm', ['playwright', 'install', 'chromium']);

  if (process.env.E2E_CI_SETUP === 'electron') {
    const xvfb = spawnSync('sh', ['-c', 'command -v xvfb-run'], { stdio: 'ignore' });
    if (xvfb.status !== 0) {
      run('sudo', ['apt-get', 'update']);
      run('sudo', ['apt-get', 'install', '-y', 'xvfb']);
    }
  }

  appendFileSync(process.env.GITHUB_OUTPUT, 'tests-started=true\n');
}

run(
  process.env.E2E_CI_SETUP === 'electron' ? 'xvfb-run' : command,
  process.env.E2E_CI_SETUP === 'electron' ? ['-a', command, ...args] : args,
);
