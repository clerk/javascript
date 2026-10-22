import { UnusableAgentKey, isSet, readAgent, type Agent } from '../../specs/support/agent.ts';
import { AGENT_CREDENTIAL_VARIABLES } from './launch.mjs';
import { VerifyFailure, type DoctorCheck } from './types.ts';

export type AgentSource = () => Agent | null;

type Env = Readonly<Record<string, string | undefined>>;

function readOrKeysMissing(env: Env): Agent | null {
  try {
    return readAgent(env);
  } catch (error) {
    if (!(error instanceof UnusableAgentKey)) throw error;
    throw new VerifyFailure('KEYS_MISSING', error.what, error.fix);
  }
}

export function takeAgent(env: NodeJS.ProcessEnv): AgentSource {
  const taken = { AI_GATEWAY_API_KEY: env.AI_GATEWAY_API_KEY, AI_GATEWAY_API_KEY_FILE: env.AI_GATEWAY_API_KEY_FILE };
  for (const name of AGENT_CREDENTIAL_VARIABLES) delete env[name];
  let read: { readonly agent: Agent | null } | null = isSet(taken.AI_GATEWAY_API_KEY) ? { agent: readOrKeysMissing(taken) } : null;
  return () => (read ??= { agent: readOrKeysMissing(taken) }).agent;
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
