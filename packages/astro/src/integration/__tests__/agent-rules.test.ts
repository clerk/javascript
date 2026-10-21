import type * as AgentRules from '@clerk/shared/agentRules';
import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { automatedEnvironmentVariables } from '@clerk/shared/utils';
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
    for (const name of automatedEnvironmentVariables) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes the Astro rules once per process', async () => {
    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    writeAgentRulesOnce(new URL('file:///app/'));
    writeAgentRulesOnce(new URL('file:///app/'));

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app/', sdks: ['astro'] }));
  });

  it('skips in CI', async () => {
    vi.stubEnv('CI', 'true');

    (await loadWriteAgentRulesOnce())(new URL('file:///app/'));

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    (await loadWriteAgentRulesOnce())(new URL('file:///app/'));

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when CLERK_AGENTS_MD is false', async () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'false');

    (await loadWriteAgentRulesOnce())(new URL('file:///app/'));

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('does not throw when writing fails', async () => {
    vi.mocked(writeClerkAgentRules).mockImplementation(() => {
      throw new Error('EACCES');
    });

    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    expect(() => writeAgentRulesOnce(new URL('file:///app/'))).not.toThrow();
  });
});
