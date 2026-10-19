import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { isAgentEnvironment, isAutomatedEnvironment } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/shared/agentRules', () => ({ writeClerkAgentRules: vi.fn() }));
vi.mock('@clerk/shared/utils', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/utils')>()),
  isAgentEnvironment: vi.fn(),
  isAutomatedEnvironment: vi.fn(),
}));
vi.mock('../fs/utils', () => ({
  nodeCwdOrThrow: () => () => '/app',
  nodeFsOrThrow: () => ({}),
  nodePathOrThrow: () => ({}),
}));

const loadWriteAgentRulesOnce = async () => (await import('../agent-rules-node.js')).writeAgentRulesOnce;

describe('writeAgentRulesOnce', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mocked(writeClerkAgentRules).mockReset();
    vi.mocked(isAgentEnvironment).mockReturnValue(true);
    vi.mocked(isAutomatedEnvironment).mockReturnValue(false);
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes the Next.js rules once per process', async () => {
    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    writeAgentRulesOnce();
    writeAgentRulesOnce();

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app', sdks: ['nextjs'] }));
  });

  it('skips outside an agent environment', async () => {
    vi.mocked(isAgentEnvironment).mockReturnValue(false);

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in CI', async () => {
    vi.mocked(isAutomatedEnvironment).mockReturnValue(true);

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('does not throw when writing fails', async () => {
    vi.mocked(writeClerkAgentRules).mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(await loadWriteAgentRulesOnce()).not.toThrow();
  });
});
