import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  agentEnvironmentVariables,
  automatedEnvironmentVariables,
  isAgentEnvironment,
  isAutomatedEnvironment,
  isClerkAgentRulesWriteAllowed,
} from '../utils/runtimeEnvironment';

describe('isAutomatedEnvironment', () => {
  beforeEach(() => {
    automatedEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true when a CI environment variable is enabled', () => {
    vi.stubEnv('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });

  it('returns false when automation environment variables are explicitly falsey', () => {
    const falseyValues = ['false', '0', 'off', 'no'];

    automatedEnvironmentVariables.forEach((name, index) => {
      vi.stubEnv(name, falseyValues[index % falseyValues.length]);
    });

    expect(isAutomatedEnvironment()).toBe(false);
  });

  it('detects automation environment variables from shared runtime fallbacks', () => {
    vi.stubEnv('CI', undefined);
    vi.stubGlobal('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });

  it('does not treat presence-sensitive build tool variables as automation signals', () => {
    vi.stubEnv('NOW_BUILDER', '1');

    expect(isAutomatedEnvironment()).toBe(false);
  });

  it('does not treat interactive development host variables as automation signals', () => {
    vi.stubEnv('CODESPACES', 'true');
    vi.stubEnv('GITPOD_WORKSPACE_ID', 'workspace-id');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('NETLIFY', 'true');

    expect(isAutomatedEnvironment()).toBe(false);
  });

  it('ignores non-string automation environment variables from shared runtime fallbacks', () => {
    vi.stubEnv('CI', undefined);
    vi.stubGlobal('CI', true);

    expect(isAutomatedEnvironment()).toBe(false);
  });
});

describe('isAgentEnvironment', () => {
  beforeEach(() => {
    for (const name of agentEnvironmentVariables) {
      vi.stubEnv(name, undefined);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['CLAUDECODE', 'CODEX_THREAD_ID', 'GEMINI_CLI', 'OPENCODE', 'AI_AGENT'])(
    'returns true when %s is set',
    name => {
      vi.stubEnv(name, '1');

      expect(isAgentEnvironment()).toBe(true);
    },
  );

  it('returns false when agent environment variables are unset or falsey', () => {
    vi.stubEnv('CLAUDECODE', 'false');
    vi.stubEnv('CURSOR_AGENT', '0');

    expect(isAgentEnvironment()).toBe(false);
  });

  it('returns true only when CURSOR_EXTENSION_HOST_ROLE is agent-exec', () => {
    vi.stubEnv('CURSOR_EXTENSION_HOST_ROLE', 'user');
    expect(isAgentEnvironment()).toBe(false);

    vi.stubEnv('CURSOR_EXTENSION_HOST_ROLE', 'agent-exec');
    expect(isAgentEnvironment()).toBe(true);
  });
});

describe('isClerkAgentRulesWriteAllowed', () => {
  beforeEach(() => {
    for (const name of [...automatedEnvironmentVariables, ...agentEnvironmentVariables]) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLAUDECODE', '1');
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows writes in development when an AI agent is detected', () => {
    expect(isClerkAgentRulesWriteAllowed()).toBe(true);
  });

  it('blocks writes when no AI agent is detected', () => {
    vi.stubEnv('CLAUDECODE', '');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it('blocks writes in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it('blocks writes in CI', () => {
    vi.stubEnv('CI', 'true');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it('blocks writes in tests', () => {
    vi.stubEnv('NODE_ENV', 'test');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it.each(['false', 'FALSE', '0', 'off', 'no', ' false', 'false '])(
    'blocks writes when CLERK_AGENTS_MD is %s',
    value => {
      vi.stubEnv('CLERK_AGENTS_MD', value);

      expect(isClerkAgentRulesWriteAllowed()).toBe(false);
    },
  );

  it('allows writes when CLERK_AGENTS_MD is unset', () => {
    vi.stubEnv('CLERK_AGENTS_MD', undefined);

    expect(isClerkAgentRulesWriteAllowed()).toBe(true);
  });

  it('allows writes when CLERK_AGENTS_MD is true', () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'true');

    expect(isClerkAgentRulesWriteAllowed()).toBe(true);
  });
});
