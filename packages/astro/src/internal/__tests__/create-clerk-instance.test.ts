import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockLoadClerkUIScript = vi.fn();
const mockLoadClerkJSScript = vi.fn();

vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJSScript: (...args: unknown[]) => mockLoadClerkJSScript(...args),
  loadClerkUIScript: (...args: unknown[]) => mockLoadClerkUIScript(...args),
  setClerkJSLoadingErrorPackageName: vi.fn(),
}));

// Mock nanostores
vi.mock('../../stores/external', () => ({
  $clerkStore: { notify: vi.fn() },
}));

vi.mock('../../stores/internal', () => ({
  $clerk: { get: vi.fn(), set: vi.fn() },
  $csrState: { setKey: vi.fn() },
}));

vi.mock('../invoke-clerk-astro-js-functions', () => ({
  invokeClerkAstroJSFunctions: vi.fn(),
}));

vi.mock('../mount-clerk-astro-js-components', () => ({
  mountAllClerkAstroJSComponents: vi.fn(),
}));

const mockClerkUICtor = vi.fn();

describe('getClerkUIEntryChunk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    (window as any).__internal_ClerkUICtor = undefined;
    (window as any).Clerk = undefined;
  });

  afterEach(() => {
    (window as any).__internal_ClerkUICtor = undefined;
    (window as any).Clerk = undefined;
  });

  it('preserves clerkUIUrl from options', async () => {
    mockLoadClerkUIScript.mockImplementation(async () => {
      (window as any).__internal_ClerkUICtor = mockClerkUICtor;
      return null;
    });

    mockLoadClerkJSScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn(),
      };
      return null;
    });

    // Dynamically import to get fresh module with mocks
    const { createClerkInstance } = await import('../create-clerk-instance');

    // Call createClerkInstance with clerkUIUrl
    await createClerkInstance({
      publishableKey: 'pk_test_xxx',
      clerkUIUrl: 'https://custom.selfhosted.example.com/ui.js',
    });

    expect(mockLoadClerkUIScript).toHaveBeenCalled();
    const loadClerkUIScriptCall = mockLoadClerkUIScript.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(loadClerkUIScriptCall?.clerkUIUrl).toBe('https://custom.selfhosted.example.com/ui.js');
  });

  it('does not set clerkUIUrl when not provided', async () => {
    mockLoadClerkUIScript.mockImplementation(async () => {
      (window as any).__internal_ClerkUICtor = mockClerkUICtor;
      return null;
    });

    mockLoadClerkJSScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn(),
      };
      return null;
    });

    const { createClerkInstance } = await import('../create-clerk-instance');

    await createClerkInstance({
      publishableKey: 'pk_test_xxx',
    });

    expect(mockLoadClerkUIScript).toHaveBeenCalled();
    const loadClerkUIScriptCall = mockLoadClerkUIScript.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(loadClerkUIScriptCall?.clerkUIUrl).toBeUndefined();
  });
});
