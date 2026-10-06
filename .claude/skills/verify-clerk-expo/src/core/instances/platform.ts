import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sleep as defaultSleep, type Runner } from '../exec.ts';
import { Secret } from '../secret.ts';
import { VerifyFailure, type Brand, type Json, type PublishableKey } from '../types.ts';
import { SettingsRefused } from './settings.ts';

export const THROWAWAY_PREFIX = 'verify-throwaway-';

const DEADLINE = /^verify-throwaway-until-(\d{4})(\d{2})(\d{2})t(\d{2})(\d{2})z-[0-9a-f]{8}$/;

export function throwawayName(deadline: Date, random: string): string {
  const stamp = deadline.toISOString().replace(/[-:]/g, '').slice(0, 13).toLowerCase();
  return `${THROWAWAY_PREFIX}until-${stamp}z-${random}`;
}

export function deadlineOf(name: string): Date | null {
  const match = DEADLINE.exec(name);
  if (match === null) return null;
  const [, year, month, day, hour, minute] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
}

const VERIFICATION_WORKSPACE = 'org_3KHungJxbvIscuSvy8oos5MHAli';

const REFERENCE_SHAPE = 'op://<vault>/<item>/credential';
const REFERENCE_FILE = ['.verify', 'clerk-platform-key-reference'] as const;
const REFERENCED_ITEM = 'the 1Password item the reference names';

const PLATFORM_API = 'https://api.clerk.com/v1/platform';
const SCOPES = 'applications:read, applications:manage, and applications:delete';
const OP_WAIT_SECONDS = 60;
const GUARD_FRESH_MS = 30_000;
const RATE_LIMIT_WAITS = [2, 4, 8, 16, 30, 30] as const;
const RETRY_AFTER_CAP_SECONDS = 60;
const NOT_ABOUT_THE_BODY: ReadonlySet<number> = new Set([401, 403, 404, 408]);

export type PlatformCredential =
  | { readonly via: 'environment'; readonly variable: 'CLERK_PLATFORM_API_KEY' | 'CLERK_PLATFORM_API_KEY_FILE'; readonly key: Secret<'clerk-platform-key'> }
  | { readonly via: 'one-password'; readonly key: Secret<'clerk-platform-key'> };

export function describeCredential(credential: PlatformCredential): string {
  switch (credential.via) {
    case 'environment':
      return credential.variable;
    case 'one-password':
      return '1Password';
    default: {
      const exhaustive: never = credential;
      return exhaustive;
    }
  }
}

export type ThrowawayApplication = Brand<{ readonly id: string; readonly name: string }, 'ThrowawayApplication'>;

export function throwawayApplication(id: string, name: string): ThrowawayApplication {
  if (!name.startsWith(THROWAWAY_PREFIX)) throw new Error(`${name} lacks the ${THROWAWAY_PREFIX} prefix`);
  return { id, name } as ThrowawayApplication;
}

export interface CreatedApplication {
  readonly application: ThrowawayApplication;
  readonly instanceId: string;
  readonly pk: PublishableKey;
  readonly sk: Secret<'clerk-secret-key'>;
}

export interface Listing {
  readonly applications: readonly ThrowawayApplication[];
  readonly at: Date | null;
}

export interface OpenWorkspace {
  readonly credential: PlatformCredential;
  readonly workspace: string;
  readonly opened: Listing;
  list(): Promise<Listing>;
  create(name: string): Promise<CreatedApplication>;
  configure(created: Pick<CreatedApplication, 'application' | 'instanceId'>, config: { readonly [key: string]: Json }, options?: { readonly dryRun?: boolean }): Promise<{ readonly after: Json }>;
  delete(application: ThrowawayApplication): Promise<void>;
}

export interface Platform {
  open(): Promise<OpenWorkspace>;
  requests(): number;
}

export interface PlatformDeps {
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly runner: Runner;
  readonly progress: (line: string) => void;
  readonly fetch?: typeof fetch;
  readonly sleep?: (ms: number) => Promise<void>;
  readonly now?: () => number;
}

interface Answer {
  readonly status: number;
  readonly json: unknown;
  readonly codes: readonly string[];
  readonly date: Date | null;
}

type Key = Secret<'clerk-platform-key'>;

const noCredential = (tried: readonly string[], onAMac: string): VerifyFailure =>
  new VerifyFailure(
    'KEYS_MISSING',
    `no Clerk Platform API credential works here (${tried.join('; ')})`,
    `on a Mac, ${onAMac}; anywhere, set CLERK_PLATFORM_API_KEY to the team key, or CLERK_PLATFORM_API_KEY_FILE to a file that holds it and that only you can read`,
  );

type KeyReference = Secret<'one-password-reference'>;

function keyReference(env: PlatformDeps['env']): KeyReference | null {
  const held = (value: string, source: string): KeyReference => {
    if (!value.startsWith('op://')) throw new VerifyFailure('USAGE', `${source} does not hold a 1Password secret reference`, `put a reference of the shape ${REFERENCE_SHAPE} there, or remove it`);
    return new Secret('one-password-reference', value);
  };
  const inline = env.VERIFY_PLATFORM_KEY_REFERENCE?.trim() ?? '';
  if (inline !== '') return held(inline, 'VERIFY_PLATFORM_KEY_REFERENCE');
  const home = env.HOME ?? '';
  if (home === '') return null;
  const file = join(home, ...REFERENCE_FILE);
  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch (error) {
    const { code } = error as NodeJS.ErrnoException;
    if (code === 'ENOENT') return null;
    throw new VerifyFailure('USAGE', `${file} cannot be read (${code ?? (error as Error).message})`, `make it readable by you alone (chmod 600 ${file}), or remove it`);
  }
  const line = text.split('\n').map((each) => each.trim()).find((each) => each !== '');
  return line === undefined ? null : held(line, file);
}

function withoutReference(text: string, reference: string): string {
  const named = reference.slice('op://'.length).split('/').slice(0, 2);
  return [reference, ...named].filter((part) => part !== '').reduce((out, part) => out.split(part).join('<redacted>'), text);
}

function keyFromText(text: string, source: string): Secret<'clerk-platform-key'> {
  const value = text.trim();
  if (!/^ak_[A-Za-z0-9_-]+$/.test(value)) throw new VerifyFailure('KEYS_MISSING', `${source} does not hold a Clerk Platform API key (those start with ak_)`, `put the team key in ${source}, or unset it`);
  return new Secret('clerk-platform-key', value);
}

function environmentCredential(env: PlatformDeps['env']): Extract<PlatformCredential, { via: 'environment' }> | null {
  const inline = env.CLERK_PLATFORM_API_KEY;
  if (inline !== undefined && inline.trim() !== '') return { via: 'environment', variable: 'CLERK_PLATFORM_API_KEY', key: keyFromText(inline, 'CLERK_PLATFORM_API_KEY') };
  const file = env.CLERK_PLATFORM_API_KEY_FILE;
  if (file === undefined || file.trim() === '') return null;
  let mode: number;
  try {
    mode = statSync(file).mode;
  } catch {
    throw new VerifyFailure('KEYS_MISSING', `CLERK_PLATFORM_API_KEY_FILE names ${file}, which does not exist`, 'unset CLERK_PLATFORM_API_KEY_FILE, or point it at a file that holds the key');
  }
  if ((mode & 0o077) !== 0) throw new VerifyFailure('KEYS_MISSING', `${file} can be read by other users of this machine`, `chmod 600 ${file}`);
  return { via: 'environment', variable: 'CLERK_PLATFORM_API_KEY_FILE', key: keyFromText(readFileSync(file, 'utf8'), file) };
}

export function createPlatform(deps: PlatformDeps): Platform {
  const request = deps.fetch ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const now = deps.now ?? Date.now;
  let sent = 0;
  let opened: Promise<OpenWorkspace> | undefined;

  async function send(key: Key, method: string, path: string, body?: unknown): Promise<Answer> {
    for (let attempt = 0; ; attempt += 1) {
      sent += 1;
      const headers: Record<string, string> = { 'User-Agent': 'verify-instances' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const call = (authorization: string) =>
        request(`${PLATFORM_API}${path}`, {
          method,
          headers: { ...headers, Authorization: authorization },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          signal: AbortSignal.timeout(30_000),
        });
      let response: Response;
      try {
        response = await key.use('platform-authorization', (plain) => call(`Bearer ${plain}`));
      } catch (error) {
        const cause = (error as { cause?: { code?: string } }).cause?.code;
        throw new VerifyFailure('NOT_READY', `Clerk's Platform API did not answer ${method} ${path}: ${(error as Error).message}${cause === undefined ? '' : ` (${cause})`}`, 'check network access to api.clerk.com');
      }
      const wait = RATE_LIMIT_WAITS[attempt];
      if (response.status === 429 && wait !== undefined) {
        const asked = Number(response.headers.get('retry-after'));
        const seconds = Number.isFinite(asked) && asked > 0 ? Math.min(asked, RETRY_AFTER_CAP_SECONDS) : wait;
        deps.progress(`wait    Clerk's Platform API is rate limiting the verification workspace (100 requests a minute, shared by every session); retrying ${method} ${path} in ${seconds}s`);
        await response.arrayBuffer().catch(() => undefined);
        await sleep(seconds * 1000);
        continue;
      }
      const text = await response.text();
      let json: unknown = null;
      try {
        json = text === '' ? null : JSON.parse(text);
      } catch {
        json = null;
      }
      const errors = (json as { errors?: { code?: unknown }[] } | null)?.errors;
      const date = Date.parse(response.headers.get('date') ?? '');
      return { status: response.status, json, codes: Array.isArray(errors) ? errors.map((e) => (typeof e.code === 'string' ? e.code : 'unknown')) : [], date: Number.isNaN(date) ? null : new Date(date) };
    }
  }

  const said = (answer: Answer): string => `${answer.status}${answer.codes.length === 0 ? '' : ` ${[...new Set(answer.codes)].join(', ')}`}`;

  function refused(answer: Answer, what: string): VerifyFailure {
    if (answer.status === 429) return new VerifyFailure('RATE_LIMITED', `Clerk's Platform API kept rate limiting ${what}`, 'wait a minute and rerun; the limit is 100 requests a minute for the whole verification workspace');
    if (answer.codes.includes('authorization_missing_scopes')) return new VerifyFailure('KEYS_MISSING', `the Platform API key lacks a scope that ${what} needs (${said(answer)})`, `use a key with ${SCOPES}`);
    return new VerifyFailure('NOT_READY', `Clerk's Platform API answered ${said(answer)} to ${what}`, 'rerun; if it repeats, run `{cli} doctor`');
  }

  async function reaches(key: Key): Promise<{ readonly workspace: string } | { readonly refusal: string }> {
    const answer = await send(key, 'GET', '/me');
    if (answer.status === 401 || answer.status === 403) return { refusal: said(answer) };
    const subject = (answer.json as { subject?: unknown } | null)?.subject;
    if (answer.status !== 200 || typeof subject !== 'string') throw refused(answer, 'the request that asks which workspace the key belongs to');
    return { workspace: subject };
  }

  const keyOf = (credential: PlatformCredential): string => (credential.via === 'one-password' ? `the key in ${REFERENCED_ITEM}` : describeCredential(credential));

  function wrongWorkspace(found: string, credential: PlatformCredential): VerifyFailure {
    return new VerifyFailure(
      'KEYS_MISSING',
      `${keyOf(credential)} belongs to workspace ${found}, and verification creates applications only in ${VERIFICATION_WORKSPACE}`,
      'use the team key; a key of any other workspace is refused',
    );
  }

  async function resolve(): Promise<PlatformCredential> {
    let reference: KeyReference | null = null;
    let unreadable: unknown;
    try {
      reference = keyReference(deps.env);
    } catch (error) {
      unreadable = error;
    }
    const checked = async (credential: PlatformCredential, key: Key, onRefusal: (refusal: string) => VerifyFailure): Promise<PlatformCredential> => {
      const reached = await reaches(key);
      if ('refusal' in reached) throw onRefusal(reached.refusal);
      if (reached.workspace !== VERIFICATION_WORKSPACE) throw wrongWorkspace(reached.workspace, credential);
      return credential;
    };

    const fromEnvironment = environmentCredential(deps.env);
    if (fromEnvironment !== null) {
      return checked(fromEnvironment, fromEnvironment.key, (refusal) => new VerifyFailure('KEYS_MISSING', `${fromEnvironment.variable} is set, and Clerk's Platform API answered ${refusal} to it`, 'set it to the team key, or unset it so the next source is tried'));
    }
    const tried = ['CLERK_PLATFORM_API_KEY and CLERK_PLATFORM_API_KEY_FILE are not set'];

    if (unreadable !== undefined) throw unreadable;
    if (reference === null) {
      tried.push('no 1Password reference is set');
      throw noCredential(
        tried,
        `put the team key's 1Password secret reference (shape ${REFERENCE_SHAPE}; the team's private setup note has the real one) in VERIFY_PLATFORM_KEY_REFERENCE or as the one line of ~/${REFERENCE_FILE.join('/')}, with the 1Password CLI installed and its desktop app integration on`,
      );
    }
    if ((await deps.runner('op', ['--version'])).code !== 0) {
      tried.push('the 1Password CLI (op) is not installed');
      throw noCredential(tried, 'install the 1Password CLI and turn on its desktop app integration');
    }
    deps.progress(`wait    reading the team key from 1Password; approve the request in the 1Password app within ${OP_WAIT_SECONDS}s`);
    const read = await reference.use('one-password-read', async (plain) => {
      const result = await deps.runner('op', ['read', '--no-newline', plain], { timeoutMs: OP_WAIT_SECONDS * 1000 });
      return { ...result, stderr: withoutReference(result.stderr, plain) };
    });
    if (read.code !== 0 || read.stdout.trim() === '') {
      const why = read.code === 124 ? `was not approved within ${OP_WAIT_SECONDS}s` : `failed: ${read.stderr.trim().split('\n')[0] || `exit ${read.code}`}`;
      throw new VerifyFailure('KEYS_MISSING', `op read of ${REFERENCED_ITEM} ${why}`, 'approve the request in the 1Password app (Settings, Developer, "Integrate with 1Password CLI" must be on) and rerun; or set CLERK_PLATFORM_API_KEY');
    }
    const credential: PlatformCredential = { via: 'one-password', key: keyFromText(read.stdout, REFERENCED_ITEM) };
    return checked(credential, credential.key, (refusal) => new VerifyFailure('KEYS_MISSING', `Clerk's Platform API answered ${refusal} to the key in ${REFERENCED_ITEM}`, 'the item holds a key that no longer works; replace it with a current team key'));
  }

  function parseEntries(json: unknown): readonly { readonly id: string; readonly name: string }[] | null {
    if (!Array.isArray(json)) return null;
    const out: { id: string; name: string }[] = [];
    for (const item of json as readonly { application_id?: unknown; name?: unknown }[]) {
      if (typeof item?.application_id !== 'string' || typeof item.name !== 'string') return null;
      out.push({ id: item.application_id, name: item.name });
    }
    return out;
  }

  async function everyApplication(key: Key): Promise<{ readonly entries: readonly { readonly id: string; readonly name: string }[]; readonly date: Date | null }> {
    const answer = await send(key, 'GET', '/applications');
    if (answer.status !== 200) throw refused(answer, 'the application list');
    const entries = parseEntries(answer.json);
    if (entries === null) {
      throw new VerifyFailure('NOT_READY', "Clerk's application list no longer has a shape this tool can read in full, so it cannot tell what the workspace holds", 'report this as a verify bug; nothing was created or deleted');
    }
    return { entries, date: answer.date };
  }

  async function open(): Promise<OpenWorkspace> {
    const credential = await resolve();
    const key: Key = credential.key;
    let checkedAt = 0;

    async function list(): Promise<Listing> {
      const { entries, date } = await everyApplication(key);
      const foreign = entries.filter((entry) => !entry.name.startsWith(THROWAWAY_PREFIX));
      if (foreign.length > 0) {
        throw new VerifyFailure(
          'NOT_READY',
          `workspace ${VERIFICATION_WORKSPACE} holds ${foreign.length} application(s) whose name does not start with ${THROWAWAY_PREFIX} (${foreign.map((entry) => entry.id).join(', ')}), so nothing is created or deleted there`,
          'the verification workspace must hold only throwaway applications; move those out of it',
        );
      }
      checkedAt = now();
      return { applications: entries.map((entry) => throwawayApplication(entry.id, entry.name)), at: date };
    }

    const guard = async (): Promise<void> => {
      if (now() - checkedAt <= GUARD_FRESH_MS) return;
      const reached = await reaches(key);
      if ('refusal' in reached) throw new VerifyFailure('KEYS_MISSING', `Clerk's Platform API answered ${reached.refusal} to ${keyOf(credential)}`, 'run `{cli} doctor`');
      if (reached.workspace !== VERIFICATION_WORKSPACE) throw wrongWorkspace(reached.workspace, credential);
      await list();
    };

    return {
      credential,
      workspace: VERIFICATION_WORKSPACE,
      opened: await list(),
      list,
      async create(name) {
        throwawayApplication('', name);
        await guard();
        const answer = await send(key, 'POST', '/applications', { name });
        const body = answer.json as { application_id?: unknown; instances?: readonly { environment_type?: unknown; instance_id?: unknown; publishable_key?: unknown; secret_key?: unknown }[] } | null;
        if (answer.status !== 200 && answer.status !== 201) throw refused(answer, `creating ${name}`);
        const development = body?.instances?.find((instance) => instance.environment_type === 'development');
        if (typeof body?.application_id !== 'string' || typeof development?.instance_id !== 'string' || typeof development.publishable_key !== 'string' || typeof development.secret_key !== 'string') {
          throw new VerifyFailure('NOT_READY', `Clerk created ${name} and the answer carries no development instance keys`, '{cli} down deletes it; then report this as a verify bug');
        }
        return {
          application: throwawayApplication(body.application_id, name),
          instanceId: development.instance_id,
          pk: development.publishable_key as PublishableKey,
          sk: new Secret('clerk-secret-key', development.secret_key),
        };
      },
      async configure(created, config, options = {}) {
        const answer = await send(key, 'PATCH', `/applications/${created.application.id}/instances/${created.instanceId}/config${options.dryRun === true ? '?dry_run=true' : ''}`, config);
        if (answer.status === 200) return { after: (answer.json as { after?: Json } | null)?.after ?? null };
        const first = (answer.json as { errors?: readonly { message?: unknown; long_message?: unknown; meta?: { param_name?: unknown } }[] } | null)?.errors?.[0];
        const param = typeof first?.meta?.param_name === 'string' ? first.meta.param_name : null;
        if (answer.status < 400 || answer.status >= 500 || answer.status === 429 || (param === null && NOT_ABOUT_THE_BODY.has(answer.status))) throw refused(answer, `configuring ${created.application.name}`);
        const message = typeof first?.long_message === 'string' ? first.long_message : typeof first?.message === 'string' ? first.message : null;
        const what = param === null ? said(answer) : `${param} (${said(answer)})`;
        const refusal = { param, said: message === null ? what : `${what}: ${message}` };
        throw new SettingsRefused(`Clerk's Platform API refused the config of ${created.application.name}: ${refusal.said}`, 'run `{cli} doctor`', refusal);
      },
      async delete(application) {
        await guard();
        const answer = await send(key, 'DELETE', `/applications/${application.id}`);
        if (answer.status !== 200 && answer.status !== 404) throw refused(answer, `deleting ${application.name}`);
      },
    };
  }

  return {
    open: () => (opened ??= open()),
    requests: () => sent,
  };
}
