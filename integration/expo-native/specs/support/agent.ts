import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { Secret } from './secret.ts';

export const DEFAULT_AGENT_MODEL = 'anthropic/claude-haiku-5.5';
export const BACKUP_AGENT_MODEL = 'openai/gpt-6-luna-fast';

type Env = Readonly<Record<string, string | undefined>>;
type GatewayKey = Secret<'ai-gateway-key'>;

export type AgentCredential =
  | { readonly variable: 'AI_GATEWAY_API_KEY'; readonly key: GatewayKey }
  | { readonly variable: 'AI_GATEWAY_API_KEY_FILE'; readonly file: string; readonly key: GatewayKey };

export interface Agent {
  readonly model: string;
  readonly backup: string;
  readonly credential: AgentCredential;
}

export class UnusableAgentKey extends Error {
  readonly what: string;
  readonly fix: string;
  constructor(what: string, fix: string) {
    super(`${what}; ${fix}`);
    this.what = what;
    this.fix = fix;
  }
}

export const isSet = (value: string | undefined): value is string => value !== undefined && value.trim() !== '';

function keyFromFile(file: string): GatewayKey {
  const unusable = (why: string) => new UnusableAgentKey(`AI_GATEWAY_API_KEY_FILE names ${file}, which ${why}`, 'unset AI_GATEWAY_API_KEY_FILE, or point it at a file that holds the Vercel AI Gateway key');
  let mode: number;
  try {
    mode = statSync(file).mode;
  } catch {
    throw unusable('does not exist');
  }
  if ((mode & 0o077) !== 0) throw new UnusableAgentKey(`${file} can be read by other users of this machine`, `chmod 600 ${file}`);
  let value: string;
  try {
    value = readFileSync(file, 'utf8').trim();
  } catch (error) {
    throw unusable(`cannot be read (${(error as NodeJS.ErrnoException).code ?? (error as Error).message})`);
  }
  if (value === '') throw new UnusableAgentKey(`${file} holds no key`, `put the Vercel AI Gateway key in ${file}, or unset AI_GATEWAY_API_KEY_FILE`);
  return new Secret('ai-gateway-key', value);
}

function credential(env: Env): AgentCredential | null {
  if (isSet(env.AI_GATEWAY_API_KEY)) return { variable: 'AI_GATEWAY_API_KEY', key: new Secret('ai-gateway-key', env.AI_GATEWAY_API_KEY.trim()) };
  if (!isSet(env.AI_GATEWAY_API_KEY_FILE)) return null;
  const file = resolve(env.AI_GATEWAY_API_KEY_FILE);
  return { variable: 'AI_GATEWAY_API_KEY_FILE', file, key: keyFromFile(file) };
}

export function readAgent(env: Env): Agent | null {
  const found = credential(env);
  if (found === null) return null;
  return { model: DEFAULT_AGENT_MODEL, backup: BACKUP_AGENT_MODEL, credential: found };
}
