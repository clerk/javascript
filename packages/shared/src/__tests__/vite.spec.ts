import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AgentRules from '../agentRules';
import { writeClerkAgentRules } from '../agentRules';
import { automatedEnvironmentVariables } from '../utils/runtimeEnvironment';
import { clerkAgentRulesVitePlugin } from '../vite';

vi.mock('../agentRules', async importOriginal => ({
  ...(await importOriginal<typeof AgentRules>()),
  writeClerkAgentRules: vi.fn(),
}));

describe('clerkAgentRulesVitePlugin', () => {
  beforeEach(() => {
    vi.mocked(writeClerkAgentRules)
      .mockReset()
      .mockReturnValue({ targetDir: '/app', agentsMd: 'unchanged', files: [] });
    for (const name of automatedEnvironmentVariables) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes the rules once when the dev server starts', async () => {
    const plugin = clerkAgentRulesVitePlugin('react');

    await plugin.configResolved({ command: 'serve', root: '/app' });
    await plugin.configResolved({ command: 'serve', root: '/app' });

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app', sdks: ['react'] }));
  });

  it('skips builds', async () => {
    await clerkAgentRulesVitePlugin('vue').configResolved({ command: 'build', root: '/app' });

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when CLERK_AGENTS_MD is false', async () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'false');

    await clerkAgentRulesVitePlugin('react').configResolved({ command: 'serve', root: '/app' });

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });
});
