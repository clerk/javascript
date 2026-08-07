import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEnvVariable } from '../getEnvVariable';

describe('getEnvVariable', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('preserves raw globalThis fallback values for backward compatibility', () => {
    vi.stubEnv('CLERK_TEST_GLOBAL_VALUE', undefined);
    vi.stubGlobal('CLERK_TEST_GLOBAL_VALUE', true);

    expect(getEnvVariable('CLERK_TEST_GLOBAL_VALUE') as unknown).toBe(true);
  });
});
