import { createClerkClient } from '@clerk/backend';
import { describe, expect, test, vi } from 'vitest';

import { clerkClient } from '../clerk-client';

vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn().mockReturnValue({}),
}));

describe('clerkClient', () => {
  test('passes runtime options to createClerkClient', () => {
    clerkClient({ locals: {} } as any, {
      secretKey: 'sk_test_runtime',
      publishableKey: 'pk_test_runtime',
    });

    expect(vi.mocked(createClerkClient)).toHaveBeenCalledWith(
      expect.objectContaining({
        secretKey: 'sk_test_runtime',
        publishableKey: 'pk_test_runtime',
      }),
    );
  });
});
