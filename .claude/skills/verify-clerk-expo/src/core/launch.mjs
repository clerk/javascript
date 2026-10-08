import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { delimiter, dirname } from 'node:path';

export const PLATFORM_CREDENTIAL_VARIABLES = ['CLERK_PLATFORM_API_KEY', 'CLERK_PLATFORM_API_KEY_FILE', 'VERIFY_PLATFORM_KEY_REFERENCE'];
export const AGENT_CREDENTIAL_VARIABLES = ['AI_GATEWAY_API_KEY', 'AI_GATEWAY_API_KEY_FILE'];

export function supportsNode(version) {
  const [major, minor] = version.split('.').map(Number);
  return major === 24 && minor >= 8;
}

function rerun(command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', env });
    for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => child.kill(signal));
    child.on('error', () => resolve(127));
    child.on('close', (code, signal) => resolve(code ?? (signal === null ? 1 : 130)));
  });
}

export async function ensureRuntime() {
  if (!supportsNode(process.versions.node)) {
    const withoutKey = Object.fromEntries(Object.entries(process.env).filter(([name]) => !PLATFORM_CREDENTIAL_VARIABLES.includes(name) && !AGENT_CREDENTIAL_VARIABLES.includes(name)));
    const node24 = process.env.VERIFY_NODE_RERUN === undefined ? (spawnSync('npx', ['-y', 'node@24', '-p', 'process.execPath'], { encoding: 'utf8', env: withoutKey }).stdout ?? '').trim() : '';
    if (node24 !== '' && existsSync(node24)) {
      console.error(`note  this is Node ${process.versions.node}; running under node@24 through npx`);
      process.exit(await rerun(node24, process.argv.slice(1), { ...process.env, PATH: `${dirname(node24)}${delimiter}${process.env.PATH ?? ''}`, VERIFY_NODE_RERUN: '1' }));
    }
    const message = `this CLI needs Node 24.8.0 or newer on 24 and this is Node ${process.versions.node}; npx could not fetch node@24`;
    const fix = 'install Node 24.8.0 or newer on 24 (nvm install 24 && nvm use 24) and rerun';
    if (process.argv.includes('--json')) console.log(JSON.stringify({ ok: false, error: { code: 'NOT_READY', message, fix, retryable: false } }));
    else console.error(`FAIL  node  ${message}\n      fix: ${fix}`);
    process.exit(3);
  }
}
