import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLoad = vi.fn().mockResolvedValue(undefined);

vi.mock('@clerk/clerk-js/no-rhc', () => {
  const Clerk = vi.fn(() => ({
    load: mockLoad,
  })) as ReturnType<typeof vi.fn> & { sdkMetadata: Record<string, string> };
  Clerk.sdkMetadata = {};
  return { Clerk };
});

import { createClerkClient } from '../clerk-client';

describe('createClerkClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('non-background (popup)', () => {
    it('returns a Clerk instance synchronously', () => {
      const clerk = createClerkClient({ publishableKey: 'pk_test_123' });
      expect(clerk).toBeDefined();
      expect(clerk).not.toBeInstanceOf(Promise);
    });
  });
});
