import type { ClerkRequest } from '@clerk/backend/internal';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadOptions } from '../loadOptions';

const featureFlags = vi.hoisted(() => ({ canUseKeyless: false }));

vi.mock('../../utils/feature-flags', () => featureFlags);
vi.mock('../constants', () => ({ commonEnvs: () => ({}) }));

const request = {} as ClerkRequest;

describe('loadOptions', () => {
  beforeEach(() => {
    featureFlags.canUseKeyless = false;
  });

  it('throws the CLI-pointing error when only the secret key is missing', () => {
    featureFlags.canUseKeyless = true;

    expect(() => loadOptions(request, { publishableKey: 'pk_test_Zm9vLWJhci0xMi5jbGVyay5hY2NvdW50cy5kZXYk' })).toThrow(
      /Missing secretKey[\s\S]*npx clerk@latest init/,
    );
  });

  it('defers to authenticateRequest in development when both keys are missing', () => {
    featureFlags.canUseKeyless = true;

    expect(() => loadOptions(request)).not.toThrow();
  });

  it('throws when both keys are missing outside development', () => {
    expect(() => loadOptions(request)).toThrow('Clerk: no secret key provided');
  });
});
