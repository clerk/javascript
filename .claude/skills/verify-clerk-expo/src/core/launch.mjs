import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
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

function accepts(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port, timeout: 1500 });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.on('connect', () => done(true));
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));
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

  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxy || process.env.NODE_USE_ENV_PROXY !== undefined) return;
  let url;
  try {
    url = new URL(proxy);
  } catch {
    return;
  }
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  const choice = chooseEgress({
    proxyListens: await accepts(url.hostname, Number(url.port || 80)),
    directConnects: await accepts('api.github.com', 443),
    tokenStatusDirect: token ? await fetch('https://api.github.com/rate_limit', { headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'verify-remote' }, signal: AbortSignal.timeout(5000) }).then((response) => response.status, () => 0) : null,
  });
  process.env.VERIFY_EGRESS_WHY = choice.why;
  if (!choice.proxy) return;
  const local = 'localhost,127.0.0.1,::1';
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  process.exit(await rerun(process.execPath, process.argv.slice(1), { ...process.env, NODE_USE_ENV_PROXY: '1', NO_PROXY: noProxy ? `${noProxy},${local}` : local }));
}

export function chooseEgress({ proxyListens, directConnects, tokenStatusDirect }) {
  if (!proxyListens) return { proxy: false, why: 'HTTPS_PROXY is set but nothing accepts connections there' };
  if (!directConnects || tokenStatusDirect === 0) return { proxy: true, why: 'a direct connection to api.github.com fails' };
  if (tokenStatusDirect === 401) return { proxy: true, why: "GitHub rejects this machine's token on a direct connection, so the proxy is where the real credential is added" };
  return { proxy: false, why: tokenStatusDirect === null ? 'a direct connection to api.github.com works' : 'a direct connection to api.github.com works and GitHub accepts the token on it' };
}
