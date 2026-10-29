import { writeClerkAgentRules } from '@clerk/shared/agentRules';
import { automatedEnvironmentVariables } from '@clerk/shared/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@clerk/shared/agentRules', async importOriginal => ({
  ...(await importOriginal<typeof import('@clerk/shared/agentRules')>()),
  writeClerkAgentRules: vi.fn(),
}));

const nodeApis = {
  nodeCwdOrThrow: () => () => '/app',
  nodeFsOrThrow: () => ({}),
  nodePathOrThrow: () => ({}),
};

const loadWriteAgentRulesOnce = async () => (await import('../agent-rules-node.js')).writeAgentRulesOnce;

describe('writeAgentRulesOnce', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('../fs/utils', () => nodeApis);
    vi.mocked(writeClerkAgentRules).mockReset();
    for (const name of automatedEnvironmentVariables) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('writes the rules once per process in development, with or without an AI agent', async () => {
    const writeAgentRulesOnce = await loadWriteAgentRulesOnce();

    writeAgentRulesOnce();
    writeAgentRulesOnce();

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app', sdks: ['nextjs'] }));
  });

  it('skips in CI', async () => {
    vi.stubEnv('CI', 'true');

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when CLERK_AGENTS_MD is false', async () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'false');

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips without a warning on the Edge runtime, where Node APIs are missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.doMock('../fs/utils', () => ({
      ...nodeApis,
      nodeCwdOrThrow: () => {
        throw new Error("Clerk: cwd is missing. This is an internal error. Please contact Clerk's support.");
      },
    }));

    (await loadWriteAgentRulesOnce())();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not throw when writing fails', async () => {
    vi.mocked(writeClerkAgentRules).mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(await loadWriteAgentRulesOnce()).not.toThrow();
  });
});
