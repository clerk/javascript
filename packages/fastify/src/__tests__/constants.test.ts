import { vi } from 'vitest';

const clonedEnvVars = {
  CLERK_API_URL: process.env.CLERK_API_URL,
  CLERK_API_VERSION: process.env.CLERK_API_VERSION,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_JWT_KEY: process.env.CLERK_JWT_KEY,
};

process.env.CLERK_API_URL = 'CLERK_API_URL';
process.env.CLERK_API_VERSION = 'CLERK_API_VERSION';
process.env.CLERK_SECRET_KEY = 'CLERK_SECRET_KEY';
process.env.CLERK_PUBLISHABLE_KEY = 'CLERK_PUBLISHABLE_KEY';
process.env.CLERK_JWT_KEY = 'CLERK_JWT_KEY';

import * as constants from '../constants';

describe('constants', () => {
  afterEach(() => {
    Object.assign(process.env, clonedEnvVars);
  });

  test('from environment variables', () => {
    vi.resetModules();
    const { Headers, Cookies, ...localConstants } = constants;

    // Verify imported constants exist but don't snapshot them
    expect(Headers).toBeDefined();
    expect(Cookies).toBeDefined();

    // Only snapshot our local constants
    expect(localConstants).toMatchSnapshot();
  });
});
