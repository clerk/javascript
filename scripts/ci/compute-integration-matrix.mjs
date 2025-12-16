import { spawnSync } from 'node:child_process';

/**
 * Outputs a JSON array usable as a GitHub Actions matrix `include`.
 * Filters to only suites where Turborepo reports affected tasks.
 */
function main() {
  const allEntries = [
    { 'test-name': 'generic', 'test-project': 'chrome' },
    { 'test-name': 'express', 'test-project': 'chrome' },
    { 'test-name': 'ap-flows', 'test-project': 'chrome' },
    { 'test-name': 'localhost', 'test-project': 'chrome' },
    { 'test-name': 'sessions', 'test-project': 'chrome' },
    { 'test-name': 'sessions:staging', 'test-project': 'chrome' },
    { 'test-name': 'handshake', 'test-project': 'chrome' },
    { 'test-name': 'handshake:staging', 'test-project': 'chrome' },
    { 'test-name': 'astro', 'test-project': 'chrome' },
    { 'test-name': 'tanstack-react-start', 'test-project': 'chrome' },
    { 'test-name': 'vue', 'test-project': 'chrome' },
    { 'test-name': 'nuxt', 'test-project': 'chrome' },
    { 'test-name': 'react-router', 'test-project': 'chrome' },
    { 'test-name': 'custom', 'test-project': 'chrome' },

    { 'clerk-use-rq': 'false', 'test-name': 'billing', 'test-project': 'chrome' },
    { 'clerk-use-rq': 'true', 'test-name': 'billing', 'test-project': 'chrome' },
    { 'clerk-use-rq': 'false', 'test-name': 'machine', 'test-project': 'chrome' },
    { 'clerk-use-rq': 'true', 'test-name': 'machine', 'test-project': 'chrome' },

    { 'next-version': '15', 'test-name': 'nextjs', 'test-project': 'chrome' },
    { 'clerk-use-rq': 'true', 'next-version': '16', 'test-name': 'nextjs', 'test-project': 'chrome' },
    { 'next-version': '16', 'test-name': 'nextjs', 'test-project': 'chrome' },

    { 'next-version': '15', 'test-name': 'quickstart', 'test-project': 'chrome' },
    { 'next-version': '16', 'test-name': 'quickstart', 'test-project': 'chrome' },
  ];

  const turboArgs = (process.env.TURBO_ARGS ?? '').split(' ').filter(Boolean);
  const uniqueSuites = [...new Set(allEntries.map(e => e['test-name']))];

  const affectedSuites = new Set(
    uniqueSuites.filter(suite => {
      const result = spawnSync(
        'pnpm',
        ['turbo', 'run', `test:integration:${suite}`, '--affected', '--dry=json', ...turboArgs],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      );

      if (result.status !== 0 || !result.stdout) {
        return false;
      }

      try {
        const parsed = JSON.parse(result.stdout);
        return Array.isArray(parsed?.tasks) && parsed.tasks.length > 0;
      } catch {
        return false;
      }
    }),
  );

  const matrix = allEntries.filter(e => affectedSuites.has(e['test-name']));
  process.stdout.write(JSON.stringify(matrix));
}

main();


