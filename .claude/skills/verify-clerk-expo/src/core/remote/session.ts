import { readFileSync } from 'node:fs';
import { Secret } from '../secret.ts';
import { VerifyFailure } from '../types.ts';
import type { SessionHealth } from './protocol.ts';
import { TUNNEL, isTunnelHost } from './tunnel.ts';

export interface SessionRef {
  readonly baseUrl: string;
  readonly tokenFile: string;
}

function sessionToken(ref: SessionRef): Secret<'session-bearer'> {
  return new Secret('session-bearer', readFileSync(ref.tokenFile, 'utf8').trim());
}

export function tunnelUrl(host: string): string {
  if (!isTunnelHost(host)) throw new VerifyFailure('NOT_READY', `the session published ${host}, which is not under ${TUNNEL.allowedHost}`, 'do not send the session token there; {cli} down, then {cli} up');
  return `https://${host}`;
}

export async function sessionCall(ref: SessionRef, path: string, init: { readonly method?: 'GET' | 'POST'; readonly json?: unknown; readonly timeoutMs?: number } = {}): Promise<Response> {
  tunnelUrl(new URL(ref.baseUrl).host);
  const body = init.json === undefined ? {} : { body: JSON.stringify(init.json) };
  return sessionToken(ref).use('session-bearer', (plain) =>
    fetch(`${ref.baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: { Authorization: `Bearer ${plain}`, ...(init.json === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...body,
      signal: AbortSignal.timeout(init.timeoutMs ?? 30_000),
    }),
  );
}

export async function sessionHealth(ref: SessionRef): Promise<SessionHealth | null> {
  try {
    const response = await sessionCall(ref, '/__sim/health', { timeoutMs: 15_000 });
    return response.status === 200 ? ((await response.json()) as SessionHealth) : null;
  } catch {
    return null;
  }
}

export async function firstHealth(ref: SessionRef, seconds: number): Promise<SessionHealth | null> {
  const deadline = Date.now() + seconds * 1000;
  for (;;) {
    const health = await sessionHealth(ref);
    if (health !== null || Date.now() >= deadline) return health;
    await new Promise((done) => setTimeout(done, 3000));
  }
}

export async function daemonHealthy(ref: SessionRef): Promise<boolean> {
  try {
    const response = await sessionCall(ref, '/agent-device/health', { timeoutMs: 15_000 });
    return response.status === 200 && /"ok":\s*true/.test(await response.text());
  } catch {
    return false;
  }
}
