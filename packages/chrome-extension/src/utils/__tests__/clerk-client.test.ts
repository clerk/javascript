import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLoad = vi.fn().mockResolvedValue(undefined);
const mockUi = { __brand: 'clerk-ui', ClerkUI: vi.fn() };

vi.mock('@clerk/clerk-js/no-rhc', () => {
  const Clerk = vi.fn(() => ({
    load: mockLoad,
  })) as ReturnType<typeof vi.fn> & { sdkMetadata: Record<string, string> };
  Clerk.sdkMetadata = {};
  return { Clerk };
});

vi.mock('@clerk/ui/no-rhc', () => ({
  ui: mockUi,
}));

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

    it('wraps load() to inject @clerk/ui', async () => {
      const clerk = createClerkClient({ publishableKey: 'pk_test_123' });
      const loadOpts = { afterSignOutUrl: '/signed-out' };

      await clerk.load(loadOpts);

      expect(mockLoad).toHaveBeenCalledOnce();
      expect(mockLoad).toHaveBeenCalledWith({
        ...loadOpts,
        ui: mockUi,
      });
    });

    it('calls load() with ui even when no options are passed', async () => {
      const clerk = createClerkClient({ publishableKey: 'pk_test_123' });

      await clerk.load();

      expect(mockLoad).toHaveBeenCalledOnce();
      expect(mockLoad).toHaveBeenCalledWith({ ui: mockUi });
    });
  });
});
