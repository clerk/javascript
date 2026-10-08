import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { AGENT_CREDENTIAL_VARIABLES } from './launch.mjs';
import { Secret } from './secret.ts';
import { VerifyFailure, type DoctorCheck } from './types.ts';

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

export type AgentSource = () => Agent | null;

const set = (value: string | undefined): value is string => value !== undefined && value.trim() !== '';

function keyFromFile(file: string): GatewayKey {
  const unusable = (why: string) => new VerifyFailure('KEYS_MISSING', `AI_GATEWAY_API_KEY_FILE names ${file}, which ${why}`, 'unset AI_GATEWAY_API_KEY_FILE, or point it at a file that holds the Vercel AI Gateway key');
  let mode: number;
  try {
    mode = statSync(file).mode;
  } catch {
    throw unusable('does not exist');
  }
  if ((mode & 0o077) !== 0) throw new VerifyFailure('KEYS_MISSING', `${file} can be read by other users of this machine`, `chmod 600 ${file}`);
  let value: string;
  try {
    value = readFileSync(file, 'utf8').trim();
  } catch (error) {
    throw unusable(`cannot be read (${(error as NodeJS.ErrnoException).code ?? (error as Error).message})`);
  }
  if (value === '') throw new VerifyFailure('KEYS_MISSING', `${file} holds no key`, `put the Vercel AI Gateway key in ${file}, or unset AI_GATEWAY_API_KEY_FILE`);
  return new Secret('ai-gateway-key', value);
}

function credential(env: Env): AgentCredential | null {
  if (set(env.AI_GATEWAY_API_KEY)) return { variable: 'AI_GATEWAY_API_KEY', key: new Secret('ai-gateway-key', env.AI_GATEWAY_API_KEY.trim()) };
  if (!set(env.AI_GATEWAY_API_KEY_FILE)) return null;
  const file = resolve(env.AI_GATEWAY_API_KEY_FILE);
  return { variable: 'AI_GATEWAY_API_KEY_FILE', file, key: keyFromFile(file) };
}

export function readAgent(env: Env): Agent | null {
  const found = credential(env);
  if (found === null) return null;
  return { model: DEFAULT_AGENT_MODEL, backup: BACKUP_AGENT_MODEL, credential: found };
}

export function takeAgent(env: NodeJS.ProcessEnv): AgentSource {
  const taken = { AI_GATEWAY_API_KEY: env.AI_GATEWAY_API_KEY, AI_GATEWAY_API_KEY_FILE: env.AI_GATEWAY_API_KEY_FILE };
  for (const name of AGENT_CREDENTIAL_VARIABLES) delete env[name];
  let read: { readonly agent: Agent | null } | null = set(taken.AI_GATEWAY_API_KEY) ? { agent: readAgent(taken) } : null;
  return () => (read ??= { agent: readAgent(taken) }).agent;
}

export function agentEnvironment(agent: Agent | null): Readonly<Record<string, string>> {
  if (agent === null) return {};
  const found = agent.credential;
  return found.variable === 'AI_GATEWAY_API_KEY_FILE' ? { AI_GATEWAY_API_KEY_FILE: found.file } : { AI_GATEWAY_API_KEY: found.key.use('e2e-agent-environment', (plain) => plain) };
}

export function agentCheck(source: AgentSource): DoctorCheck {
  let agent: Agent | null;
  try {
    agent = source();
  } catch (error) {
    if (!(error instanceof VerifyFailure)) throw error;
    return { id: 'agent', ok: false, detail: error.message, fix: error.fix };
  }
  if (agent === null) return { id: 'agent', ok: true, detail: 'none: AI_GATEWAY_API_KEY and AI_GATEWAY_API_KEY_FILE are not set, so agent.act and agent.assert have no model' };
  return { id: 'agent', ok: true, detail: `${agent.model}, with ${agent.backup} as its backup, through the Vercel AI Gateway; key from ${agent.credential.variable}` };
}
