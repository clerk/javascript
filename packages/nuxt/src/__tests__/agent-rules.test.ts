import type * as AgentRules from '@clerk/shared/agentRules';
import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { agentEnvironmentVariables, automatedEnvironmentVariables } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/shared/agentRules', async importOriginal => ({
  ...(await importOriginal<typeof AgentRules>()),
  writeClerkAgentRules: vi.fn(),
}));

const loadWriteAgentRulesOnce = async () => (await import('../agent-rules')).writeAgentRulesOnce;

describe('writeAgentRulesOnce', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(writeClerkAgentRules).mockReset();
    for (const name of [...automatedEnvironmentVariables, ...agentEnvironmentVariables]) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('CLAUDECODE', '1');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes the Nuxt rules once per process', async () => {
    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    writeAgentRulesOnce('/app');
    writeAgentRulesOnce('/app');

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app', sdks: ['nuxt'] }));
  });

  it('skips in CI', async () => {
    vi.stubEnv('CI', 'true');

    (await loadWriteAgentRulesOnce())('/app');

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    (await loadWriteAgentRulesOnce())('/app');

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when CLERK_AGENTS_MD is false', async () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'false');

    (await loadWriteAgentRulesOnce())('/app');

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('does not throw when writing fails', async () => {
    vi.mocked(writeClerkAgentRules).mockImplementation(() => {
      throw new Error('EACCES');
    });

    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    expect(() => writeAgentRulesOnce('/app')).not.toThrow();
  });
});
