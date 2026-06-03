import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { automatedEnvironmentVariables, isAutomatedEnvironment } from '../utils/runtimeEnvironment';

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
