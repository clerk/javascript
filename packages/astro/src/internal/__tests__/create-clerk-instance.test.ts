import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockLoadClerkUiScript = vi.fn();
const mockLoadClerkJsScript = vi.fn();

vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJsScript: (...args: unknown[]) => mockLoadClerkJsScript(...args),
  loadClerkUiScript: (...args: unknown[]) => mockLoadClerkUiScript(...args),
  setClerkJsLoadingErrorPackageName: vi.fn(),
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

describe('getClerkUiEntryChunk', () => {
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

  it('preserves clerkUIUrl from options when options.ui.url is not provided', async () => {
    mockLoadClerkUiScript.mockImplementation(async () => {
      (window as any).__internal_ClerkUICtor = mockClerkUICtor;
      return null;
    });

    mockLoadClerkJsScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn(),
      };
      return null;
    });

    // Dynamically import to get fresh module with mocks
    const { createClerkInstance } = await import('../create-clerk-instance');

    // Call createClerkInstance with clerkUIUrl but without ui.url
    await createClerkInstance({
      publishableKey: 'pk_test_xxx',
      clerkUIUrl: 'https://custom.selfhosted.example.com/ui.js',
    });

    expect(mockLoadClerkUiScript).toHaveBeenCalled();
    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(loadClerkUiScriptCall?.clerkUIUrl).toBe('https://custom.selfhosted.example.com/ui.js');
  });

  it('prefers options.ui.url over options.clerkUIUrl when both are provided', async () => {
    mockLoadClerkUiScript.mockImplementation(async () => {
      (window as any).__internal_ClerkUICtor = mockClerkUICtor;
      return null;
    });

    mockLoadClerkJsScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn(),
      };
      return null;
    });

    const { createClerkInstance } = await import('../create-clerk-instance');

    await createClerkInstance({
      publishableKey: 'pk_test_xxx',
      clerkUIUrl: 'https://fallback.example.com/ui.js',
      ui: {
        version: '1.0.0',
        url: 'https://preferred.example.com/ui.js',
      } as any,
    });

    expect(mockLoadClerkUiScript).toHaveBeenCalled();
    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(loadClerkUiScriptCall?.clerkUIUrl).toBe('https://preferred.example.com/ui.js');
  });

  it('does not set clerkUIUrl when neither options.ui.url nor options.clerkUIUrl is provided', async () => {
    mockLoadClerkUiScript.mockImplementation(async () => {
      (window as any).__internal_ClerkUICtor = mockClerkUICtor;
      return null;
    });

    mockLoadClerkJsScript.mockImplementation(async () => {
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

    expect(mockLoadClerkUiScript).toHaveBeenCalled();
    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(loadClerkUiScriptCall?.clerkUIUrl).toBeUndefined();
  });
});
