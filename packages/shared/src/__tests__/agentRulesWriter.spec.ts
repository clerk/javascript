import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AgentRules from '../agentRules';
import { writeClerkAgentRules } from '../agentRules';
import { createClerkAgentRulesWriter } from '../agentRulesWriter';
import { automatedEnvironmentVariables } from '../utils/runtimeEnvironment';

vi.mock('../agentRules', async importOriginal => ({
  ...(await importOriginal<typeof AgentRules>()),
  writeClerkAgentRules: vi.fn(),
}));

describe('createClerkAgentRulesWriter', () => {
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
    vi.restoreAllMocks();
  });

  it('writes once per writer from the process working directory', () => {
    const write = createClerkAgentRulesWriter('express');

    write();
    write();

    expect(writeClerkAgentRules).toHaveBeenCalledTimes(1);
    expect(writeClerkAgentRules).toHaveBeenCalledWith(
      expect.objectContaining({ cwd: process.cwd(), sdks: ['express'] }),
    );
  });

  it('writes to the directory it is given', () => {
    createClerkAgentRulesWriter('electron')('/app');

    expect(writeClerkAgentRules).toHaveBeenCalledWith(expect.objectContaining({ cwd: '/app', sdks: ['electron'] }));
  });

  it('skips in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    createClerkAgentRulesWriter('hono')();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips in CI', () => {
    vi.stubEnv('CI', 'true');

    createClerkAgentRulesWriter('hono')();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when CLERK_AGENTS_MD is false', () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'false');

    createClerkAgentRulesWriter('fastify')();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('skips when the runtime has no Node file system', () => {
    vi.spyOn(process, 'getBuiltinModule').mockReturnValue(undefined as never);

    createClerkAgentRulesWriter('hono')();

    expect(writeClerkAgentRules).not.toHaveBeenCalled();
  });

  it('warns instead of throwing when writing fails', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.mocked(writeClerkAgentRules).mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(() => createClerkAgentRulesWriter('react-router')()).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Could not update AGENTS.md for AI coding agents: EACCES'),
    );
  });
});
