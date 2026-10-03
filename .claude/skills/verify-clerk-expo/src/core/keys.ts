import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { Secret } from './secret.ts';
import { INSTANCE_NAMES, VerifyFailure, type HostAdapter, type InstanceName, type PublishableKey } from './types.ts';

export interface InstanceKeys {
  readonly pk: PublishableKey;
  readonly sk: Secret<'clerk-secret-key'>;
}

export function mainWorktree(worktree: string): string {
  const common = execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: worktree, encoding: 'utf8' }).trim();
  return dirname(isAbsolute(common) ? common : resolve(worktree, common));
}

export function keysFilePath(host: HostAdapter, worktree: string): string {
  return join(mainWorktree(worktree), host.keysFile);
}

type KeysJson = Readonly<Record<string, { readonly pk?: unknown; readonly sk?: unknown } | undefined>>;

function parseKeys(text: string, source: string, host: HostAdapter): KeysJson {
  try {
    return JSON.parse(text) as KeysJson;
  } catch {
    throw new VerifyFailure('KEYS_MISSING', `${source} is not valid JSON`, `fix ${host.keysFile} in the main worktree`);
  }
}

function readKeysJson(host: HostAdapter, worktree: string, env: Readonly<Record<string, string | undefined>>): { readonly source: string; readonly json: KeysJson } {
  const inline = env.CLERK_TEST_KEYS_JSON;
  if (inline !== undefined && inline.trim() !== '') return { source: 'CLERK_TEST_KEYS_JSON', json: parseKeys(inline, 'CLERK_TEST_KEYS_JSON', host) };
  const file = keysFilePath(host, worktree);
  if (!existsSync(file)) {
    throw new VerifyFailure('KEYS_MISSING', `no keys file at ${file}`, `put the integration ${host.keysFile} in the main worktree, or set CLERK_TEST_KEYS_JSON`);
  }
  return { source: file, json: parseKeys(readFileSync(file, 'utf8'), file, host) };
}

export function loadInstanceKeys(
  host: HostAdapter,
  instance: InstanceName,
  worktree: string,
  env: Readonly<Record<string, string | undefined>> = process.env,
): InstanceKeys {
  const { source, json } = readKeysJson(host, worktree, env);
  const entry = json[instance];
  if (typeof entry?.pk !== 'string' || typeof entry.sk !== 'string' || !/^pk_(test|live)_/.test(entry.pk) || !/^sk_(test|live)_/.test(entry.sk)) {
    throw new VerifyFailure('KEYS_MISSING', `${source} has no pk and sk for ${instance}`, `add ${instance} with pk and sk to ${host.keysFile} in the main worktree`);
  }
  return { pk: entry.pk as PublishableKey, sk: new Secret('clerk-secret-key', entry.sk) };
}

export function instancesWithKeys(host: HostAdapter, worktree: string, env: Readonly<Record<string, string | undefined>> = process.env): { readonly source: string; readonly present: readonly InstanceName[]; readonly missing: readonly InstanceName[] } {
  const { source } = readKeysJson(host, worktree, env);
  const present: InstanceName[] = [];
  const missing: InstanceName[] = [];
  for (const name of INSTANCE_NAMES) {
    try {
      loadInstanceKeys(host, name, worktree, env);
      present.push(name);
    } catch {
      missing.push(name);
    }
  }
  return { source, present, missing };
}
