import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const [envFile, ...args] = process.argv.slice(2);
if (!envFile || args.length === 0) {
  console.error('Usage: node clerk-staging.mjs <envfile|--oauth> <clerk args…>');
  process.exit(1);
}

let key;
if (envFile !== '--oauth') {
  try {
    const variables = parseEnv(readFileSync(envFile, 'utf8'));
    key = variables[process.env.CLERK_PLATFORM_KEY_VARIABLE || 'CLERK_PLATFORM_API_KEY'];
  } catch {
    console.error('Cannot read the Platform key file');
    process.exit(1);
  }
  if (!key?.trim()) {
    console.error('Missing Platform key in the supplied file');
    process.exit(1);
  }
}

const env = Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('CLERK_')));
Object.assign(env, {
  CLERK_PLATFORM_API_URL: 'https://api.clerkstage.dev',
  CLERK_BACKEND_API_URL: 'https://api.clerkstage.dev',
  CLERK_OAUTH_BASE_URL: 'https://clerk.clerkstage.dev',
});
if (key) {
  env.CLERK_PLATFORM_API_KEY = key;
}
const result = spawnSync('clerk', args, { env, stdio: 'inherit' });
if (result.error) {
  console.error('Cannot start Clerk CLI. Install it with `pnpm add --global clerk@latest`.');
}
process.exit(result.status ?? 1);
