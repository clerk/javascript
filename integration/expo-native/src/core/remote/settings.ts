import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Runner } from '../exec.ts';
import { VerifyFailure, type Platform } from '../types.ts';
import type { GitHub } from './github.ts';
import { LIMITS, REQUEST_VERSION, RequestError, parseRequest, sha256Hex, type SessionRequest } from './protocol.ts';

export interface RemoteSettings {
  readonly platform: Platform;
  readonly repo: string;
  readonly workflow: string;
  readonly sessionsDir: string;
  readonly runner: string;
  readonly plumbingRunner: string;
  readonly device: string;
  readonly idleMinutes: number;
  readonly capMinutes: number;
  readonly requirement: string;
}

export interface RemoteDeps {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly runner: Runner;
  readonly github?: () => Promise<GitHub>;
}

function minutes(env: RemoteDeps['env'], name: 'VERIFY_REMOTE_IDLE_MINUTES' | 'VERIFY_REMOTE_CAP_MINUTES', fallback: number, limits: { readonly min: number; readonly max: number }): number {
  const raw = env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < limits.min || value > limits.max) throw new VerifyFailure('USAGE', `${name}=${raw} is not a whole number from ${limits.min} to ${limits.max}`, `unset ${name} or set it within range`);
  return value;
}

export function savedDriverId(settings: RemoteSettings): string | null {
  const file = join(settings.sessionsDir, 'owner');
  if (!existsSync(file)) return null;
  const saved = readFileSync(file, 'utf8').trim();
  return /^[a-f0-9]{12}$/.test(saved) ? saved : null;
}

export function driverId(settings: RemoteSettings): string {
  const saved = savedDriverId(settings);
  if (saved !== null) return saved;
  const id = randomBytes(6).toString('hex');
  mkdirSync(settings.sessionsDir, { recursive: true, mode: 0o700 });
  writeFileSync(join(settings.sessionsDir, 'owner'), `${id}\n`, { mode: 0o600 });
  return id;
}

export function newSessionRequest(settings: RemoteSettings, deps: RemoteDeps, input: { readonly runner?: string; readonly device: string | null; readonly sha: string | null; readonly idleMinutes?: number; readonly capMinutes?: number }): { readonly request: SessionRequest; readonly token: string } {
  const token = randomBytes(32).toString('hex');
  const capMinutes = input.capMinutes ?? minutes(deps.env, 'VERIFY_REMOTE_CAP_MINUTES', settings.capMinutes, LIMITS.capMinutes);
  const draft: SessionRequest = {
    v: REQUEST_VERSION,
    session: `${settings.platform}${randomBytes(3).toString('hex')}`,
    owner: driverId(settings),
    platform: settings.platform,
    runner: input.runner ?? settings.runner,
    device: input.device,
    sha: input.sha,
    idleMinutes: Math.min(capMinutes, input.idleMinutes ?? minutes(deps.env, 'VERIFY_REMOTE_IDLE_MINUTES', settings.idleMinutes, LIMITS.idleMinutes)),
    capMinutes,
    tokenSha256: sha256Hex(token),
  };
  try {
    return { request: parseRequest(JSON.stringify(draft)), token };
  } catch (error) {
    if (!(error instanceof RequestError)) throw error;
    throw new VerifyFailure('USAGE', `the session request is not valid: ${error.message}`, 'check --runner (a runner label such as ubuntu-latest) and the device name in src/host.ts');
  }
}

export function saveToken(settings: RemoteSettings, session: string, token: string): string {
  const dir = join(settings.sessionsDir, session);
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const file = join(dir, 'token');
  writeFileSync(file, token, { mode: 0o600 });
  return file;
}

export const forgetSession = (settings: RemoteSettings, session: string): void => rmSync(join(settings.sessionsDir, session), { recursive: true, force: true });
