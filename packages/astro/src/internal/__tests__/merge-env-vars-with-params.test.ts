import { afterEach, describe, expect, it, vi } from 'vitest';

import { mergeEnvVarsWithParams } from '../merge-env-vars-with-params';

describe('mergeEnvVarsWithParams', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves an explicit unsafe_disableDevelopmentModeConsoleWarning false when env is true', () => {
    vi.stubEnv('PUBLIC_CLERK_UNSAFE_DISABLE_DEVELOPMENT_MODE_CONSOLE_WARNING', 'true');

    const result = mergeEnvVarsWithParams({
      unsafe_disableDevelopmentModeConsoleWarning: false,
    });

    expect(result.unsafe_disableDevelopmentModeConsoleWarning).toBe(false);
  });
});
