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
    agentEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true when an agent environment variable is enabled', () => {
    vi.stubEnv('CLAUDECODE', 'true');

    expect(isAgentEnvironment()).toBe(true);
  });

  it('returns false when agent environment variables are explicitly falsey', () => {
    const falseyValues = ['false', '0', 'off', 'no'];

    agentEnvironmentVariables.forEach((name, index) => {
      vi.stubEnv(name, falseyValues[index % falseyValues.length]);
    });

    expect(isAgentEnvironment()).toBe(false);
  });
});

describe('isAgentEnvironment with Cursor', () => {
  beforeEach(() => {
    agentEnvironmentVariables.forEach(name => {
      vi.stubEnv(name, undefined);
      vi.stubGlobal(name, undefined);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true when CURSOR_EXTENSION_HOST_ROLE is agent-exec', () => {
    vi.stubEnv('CURSOR_EXTENSION_HOST_ROLE', 'agent-exec');

    expect(isAgentEnvironment()).toBe(true);
  });

  it('returns false for any other CURSOR_EXTENSION_HOST_ROLE value', () => {
    vi.stubEnv('CURSOR_EXTENSION_HOST_ROLE', 'user');

    expect(isAgentEnvironment()).toBe(false);
  });

  it('returns true when CURSOR_TRACE_ID is set', () => {
    vi.stubEnv('CURSOR_TRACE_ID', 'abc123');

    expect(isAgentEnvironment()).toBe(true);
  });
});

describe('isClerkAgentRulesWriteAllowed', () => {
  beforeEach(() => {
    for (const name of automatedEnvironmentVariables) {
      vi.stubEnv(name, '');
    }
    vi.stubEnv('CLERK_AGENTS_MD', '');
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows writes in development without an AI agent', () => {
    expect(isClerkAgentRulesWriteAllowed()).toBe(true);
  });

  it('blocks writes in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it('blocks writes in CI', () => {
    vi.stubEnv('CI', 'true');

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it.each(['false', 'FALSE', '0', 'off', 'no'])('blocks writes when CLERK_AGENTS_MD is %s', value => {
    vi.stubEnv('CLERK_AGENTS_MD', value);

    expect(isClerkAgentRulesWriteAllowed()).toBe(false);
  });

  it('allows writes when CLERK_AGENTS_MD is true', () => {
    vi.stubEnv('CLERK_AGENTS_MD', 'true');

    expect(isClerkAgentRulesWriteAllowed()).toBe(true);
  });
});
