import { createHash, timingSafeEqual } from 'node:crypto';
import type { CommandLine } from '../exec.ts';
import type { Platform } from '../types.ts';

export const REQUEST_VERSION = 1 as const;

export interface SessionRequest {
  readonly v: typeof REQUEST_VERSION;
  readonly session: string;
  readonly owner: string;
  readonly platform: Platform;
  readonly runner: string;
  readonly device: string | null;
  readonly sha: string | null;
  readonly idleMinutes: number;
  readonly capMinutes: number;
  readonly tokenSha256: string;
}

export const LIMITS = { idleMinutes: { min: 1, max: 120 }, capMinutes: { min: 2, max: 360 } } as const;

export const RUNNER_LABEL = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

const SHAPE = {
  session: /^[a-z0-9]{4,24}$/,
  owner: /^[a-f0-9]{12}$/,
  runner: RUNNER_LABEL,
  device: /^[A-Za-z0-9][A-Za-z0-9 ._()-]{0,63}$/,
  sha: /^[0-9a-f]{40}$/,
  tokenSha256: /^[0-9a-f]{64}$/,
} as const;

export class RequestError extends Error {}

function whole(name: 'idleMinutes' | 'capMinutes', value: unknown): number {
  const { min, max } = LIMITS[name];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) throw new RequestError(`${name} must be a whole number from ${min} to ${max}`);
  return value;
}

export function parseRequest(text: string): SessionRequest {
  let raw: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('not an object');
    raw = parsed as Record<string, unknown>;
  } catch {
    throw new RequestError('the request is not a JSON object');
  }
  if (raw.v !== REQUEST_VERSION) throw new RequestError(`request version ${String(raw.v)} is not ${REQUEST_VERSION}`);
  const field = (name: keyof typeof SHAPE, nullable = false): string | null => {
    const value = raw[name];
    if (nullable && value === null) return null;
    if (typeof value !== 'string' || !SHAPE[name].test(value)) throw new RequestError(`${name} is missing or malformed`);
    return value;
  };
  if (raw.platform !== 'ios' && raw.platform !== 'android') throw new RequestError('platform must be ios or android');
  const request: SessionRequest = {
    v: REQUEST_VERSION,
    session: field('session')!,
    owner: field('owner')!,
    platform: raw.platform,
    runner: field('runner')!,
    device: field('device', true),
    sha: field('sha', true),
    idleMinutes: whole('idleMinutes', raw.idleMinutes),
    capMinutes: whole('capMinutes', raw.capMinutes),
    tokenSha256: field('tokenSha256')!,
  };
  if (request.idleMinutes > request.capMinutes) throw new RequestError('idleMinutes cannot exceed capMinutes');
  return request;
}

export const sha256Hex = (value: string): string => createHash('sha256').update(value).digest('hex');

export function matchesToken(tokenSha256: string, presented: string): boolean {
  const given = Buffer.from(sha256Hex(presented), 'hex');
  const want = Buffer.from(tokenSha256, 'hex');
  return given.length === want.length && timingSafeEqual(given, want);
}

export const STEP = {
  tunnelPattern: /^verify-remote tunnel ([a-z0-9.-]+)$/,
} as const;

export const RUN_TITLE = /(?:^|[ /])([a-f0-9]{12})\/([a-z0-9]{4,24})$/;

export type BuildState =
  | { readonly state: 'none' }
  | { readonly state: 'building'; readonly sha: string; readonly seconds: number }
  | { readonly state: 'built'; readonly sha: string; readonly seconds: number; readonly incremental: boolean }
  | { readonly state: 'failed'; readonly sha: string; readonly seconds: number; readonly tail: string };

export type EndReason = 'stop' | 'idle' | 'cap' | 'tunnel-lost' | 'signal';

export interface SessionHealth {
  readonly core: string;
  readonly device: { readonly id: string; readonly name: string; readonly ready: boolean } | null;
  readonly daemon: boolean;
  readonly build: BuildState;
  readonly capAt: string;
  readonly ending: EndReason | null;
}

export interface SessionDevice {
  build(work: string): readonly CommandLine[];
  readonly record: {
    start(file: string): CommandLine;
    stop?(file: string): readonly CommandLine[];
    collect?(file: string): readonly CommandLine[];
  };
  logs(since: Date, predicate: string | null): CommandLine;
}
export interface SessionDeviceRef {
  readonly id: string;
  readonly platform: Platform;
}
export type SessionDeviceFactory = (device: SessionDeviceRef) => SessionDevice;

export type RecipeRequest =
  | { readonly op: 'build'; readonly work: string }
  | { readonly op: 'record'; readonly file: string }
  | { readonly op: 'logs'; readonly since: string; readonly predicate: string | null };

export interface RecipeAnswers {
  readonly build: readonly CommandLine[];
  readonly record: { readonly start: CommandLine; readonly stop: readonly CommandLine[] | null; readonly collect: readonly CommandLine[] };
  readonly logs: CommandLine;
}

