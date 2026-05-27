import { afterEach, describe, expect, it, vi } from 'vitest';

import { isAutomatedEnvironment } from '../utils/runtimeEnvironment';

describe('isAutomatedEnvironment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns true when a CI environment variable is enabled', () => {
    vi.stubEnv('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });

  it('returns false when automation environment variables are explicitly falsey', () => {
    vi.stubEnv('CI', 'false');
    vi.stubEnv('GITHUB_ACTIONS', '0');

    expect(isAutomatedEnvironment()).toBe(false);
  });

  it('detects automation environment variables from shared runtime fallbacks', () => {
    vi.stubEnv('CI', undefined);
    vi.stubGlobal('CI', 'true');

    expect(isAutomatedEnvironment()).toBe(true);
  });
});
