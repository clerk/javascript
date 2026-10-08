import { closeSync, openSync, readFileSync, readSync } from 'node:fs';
import { sleep } from '../exec.ts';
import { Secret } from '../../../specs/support/secret.ts';
import { VerifyFailure } from '../types.ts';
import { HANDOFF_LIMITS, type HandoffManifest } from './handoff.ts';
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

interface EvidenceAnswer {
  readonly status: number;
  readonly error: string;
  readonly have: number | undefined;
}

export async function sendEvidence(ref: SessionRef, manifest: HandoffManifest, paths: ReadonlyMap<string, string>, progress: (line: string) => void, retryDelayMs = 1000): Promise<void> {
  const post = async (step: 'begin' | 'chunk' | 'commit', json: unknown): Promise<EvidenceAnswer> => {
    try {
      const response = await sessionCall(ref, `/__sim/evidence/${step}`, { method: 'POST', json, timeoutMs: 120_000 });
      const body = (await response.json().catch(() => null)) as { readonly error?: string; readonly have?: number } | null;
      return { status: response.status, error: body?.error ?? '', have: body?.have };
    } catch (error) {
      if (error instanceof VerifyFailure) throw error;
      return { status: 0, error: (error as Error).message, have: undefined };
    }
  };
  const refused = (what: string, answer: EvidenceAnswer) => new Error(`the session did not take ${what}: ${answer.status === 0 ? answer.error : `${answer.status} ${answer.error}`}`);

  const began = await post('begin', manifest);
  if (began.status !== 200) throw refused('the manifest', began);
  for (const file of manifest.files) {
    const fd = openSync(paths.get(file.name)!, 'r');
    try {
      const buffer = Buffer.alloc(HANDOFF_LIMITS.chunkBytes);
      for (let offset = 0, read = 0; (read = readSync(fd, buffer, 0, buffer.length, offset)) > 0; offset += read) {
        const data = buffer.subarray(0, read).toString('base64');
        for (let attempt = 0; ; attempt += 1) {
          const answer = await post('chunk', { name: file.name, offset, data });
          const landedOnAnEarlierAttempt = answer.status === 409 && answer.have === offset + read;
          if (answer.status === 200 || landedOnAnEarlierAttempt) break;
          const worthAnotherTry = answer.status === 0 || answer.status >= 500;
          if (!worthAnotherTry || attempt >= 2) throw refused(`${file.name} at byte ${offset}`, answer);
          await sleep(retryDelayMs * (attempt + 1));
        }
      }
    } finally {
      closeSync(fd);
    }
    progress(`handoff ${file.name}  ${file.bytes} bytes`);
  }
  const committed = await post('commit', {});
  if (committed.status !== 200) throw refused('the hand-off', committed);
}
