import { render } from '@testing-library/vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { clerkPlugin } from '../plugin';

const mockLoadClerkUiScript = vi.fn();
const mockLoadClerkJsScript = vi.fn();

vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJsScript: (...args: unknown[]) => mockLoadClerkJsScript(...args),
  loadClerkUiScript: (...args: unknown[]) => mockLoadClerkUiScript(...args),
}));

vi.mock('@clerk/shared/browser', () => ({
  inBrowser: () => true,
}));

const mockClerkUICtor = vi.fn();

describe('clerkPlugin CDN UI loading', () => {
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

  it('passes clerkUiVersion from pluginOptions.ui.version to loadClerkUiScript', async () => {
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
              ui: {
                version: '1.2.3',
              },
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });

    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0][0];
    expect(loadClerkUiScriptCall.clerkUiVersion).toBe('1.2.3');
    expect(loadClerkUiScriptCall.clerkUiUrl).toBeUndefined();
  });

  it('passes clerkUiUrl from pluginOptions.ui.url to loadClerkUiScript', async () => {
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
              ui: {
                url: 'https://custom.cdn.example.com/ui.js',
              },
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });

    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0][0];
    expect(loadClerkUiScriptCall.clerkUiUrl).toBe('https://custom.cdn.example.com/ui.js');
    expect(loadClerkUiScriptCall.clerkUiVersion).toBeUndefined();
  });

  it('passes both clerkUiVersion and clerkUiUrl when both are provided', async () => {
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
              ui: {
                version: '2.0.0',
                url: 'https://custom.cdn.example.com/ui-v2.js',
              },
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });

    const loadClerkUiScriptCall = mockLoadClerkUiScript.mock.calls[0][0];
    expect(loadClerkUiScriptCall.clerkUiVersion).toBe('2.0.0');
    expect(loadClerkUiScriptCall.clerkUiUrl).toBe('https://custom.cdn.example.com/ui-v2.js');
  });

  it('ClerkUIPromise resolves to window.__internal_ClerkUICtor after loadClerkUiScript completes', async () => {
    let capturedLoadOptions: any;

    mockLoadClerkUiScript.mockImplementation(async () => {
      window.__internal_ClerkUICtor = mockClerkUICtor as any;
      return null;
    });

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
                version: '1.0.0',
              },
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(capturedLoadOptions).toBeDefined();
    });

    const resolvedClerkUI = await capturedLoadOptions.ui.ClerkUI;
    expect(resolvedClerkUI).toBe(mockClerkUICtor);
  });
});
