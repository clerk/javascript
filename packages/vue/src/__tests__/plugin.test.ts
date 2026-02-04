import { render } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { clerkPlugin } from '../plugin';

const mockLoadClerkUiScript = vi.fn();
const mockLoadClerkJsScript = vi.fn();

vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJSScript: (...args: unknown[]) => mockLoadClerkJsScript(...args),
  loadClerkUIScript: (...args: unknown[]) => mockLoadClerkUiScript(...args),
}));

vi.mock('@clerk/shared/browser', () => ({
  inBrowser: () => true,
}));

const mockClerkUICtor = vi.fn();

describe('clerkPlugin UI loading', () => {
  const originalWindowClerk = window.Clerk;

  beforeEach(() => {
    vi.clearAllMocks();
    window.__internal_ClerkUICtor = undefined;
    (window as any).Clerk = undefined;

    mockLoadClerkJsScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn(),
      };
      return null;
    });
  });

  afterEach(() => {
    (window as any).Clerk = originalWindowClerk;
    window.__internal_ClerkUICtor = undefined;
  });

  const TestComponent = defineComponent({
    template: '<div>Test</div>',
  });

  it('loads UI from CDN when no ui prop is provided', async () => {
    mockLoadClerkUiScript.mockImplementation(async () => {
      window.__internal_ClerkUICtor = mockClerkUICtor as any;
      return null;
    });

    render(TestComponent, {
      global: {
        plugins: [
          [
            clerkPlugin,
            {
              publishableKey: 'pk_test_xxx',
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });
  });

  it('uses bundled UI when ui.ClerkUI is provided', async () => {
    let capturedLoadOptions: any;

    mockLoadClerkJsScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockImplementation(async (opts: any) => {
          capturedLoadOptions = opts;
        }),
        addListener: vi.fn(),
      };
      return null;
    });

    render(TestComponent, {
      global: {
        plugins: [
          [
            clerkPlugin,
            {
              publishableKey: 'pk_test_xxx',
              ui: {
                ClerkUI: mockClerkUICtor,
              },
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(capturedLoadOptions).toBeDefined();
    });

    // Should not load from CDN
    expect(mockLoadClerkUiScript).not.toHaveBeenCalled();

    // Should pass the bundled ClerkUI constructor
    const resolvedClerkUI = await capturedLoadOptions.ui.ClerkUI;
    expect(resolvedClerkUI).toBe(mockClerkUICtor);
  });

  it('does not load UI when prefetchUI is false', async () => {
    let capturedLoadOptions: any;

    mockLoadClerkJsScript.mockImplementation(async () => {
      (window as any).Clerk = {
        load: vi.fn().mockImplementation(async (opts: any) => {
          capturedLoadOptions = opts;
        }),
        addListener: vi.fn(),
      };
      return null;
    });

    render(TestComponent, {
      global: {
        plugins: [
          [
            clerkPlugin,
            {
              publishableKey: 'pk_test_xxx',
              prefetchUI: false,
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(capturedLoadOptions).toBeDefined();
    });

    // Should not load from CDN
    expect(mockLoadClerkUiScript).not.toHaveBeenCalled();

    // ClerkUI should be undefined (headless mode)
    const resolvedClerkUI = await capturedLoadOptions.ui.ClerkUI;
    expect(resolvedClerkUI).toBeUndefined();
  });
});
