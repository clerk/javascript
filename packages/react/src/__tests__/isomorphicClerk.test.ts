import type { Resources, UnsubscribeCallback } from '@clerk/shared/types';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { IsomorphicClerk } from '../isomorphicClerk';

const mockLoadClerkJsScript = vi.fn().mockResolvedValue(null);
const mockLoadClerkUiScript = vi.fn().mockResolvedValue(null);

// Mock the script loading functions to prevent unhandled promise rejections in tests
vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJsScript: (...args: unknown[]) => mockLoadClerkJsScript(...args),
  loadClerkUiScript: (...args: unknown[]) => mockLoadClerkUiScript(...args),
}));

describe('isomorphicClerk', () => {
  beforeAll(() => {
    vi.useFakeTimers();

    // Set up minimal global Clerk objects to prevent errors during initialization
    (global as any).Clerk = {
      load: vi.fn().mockResolvedValue(undefined),
      loaded: false,
    };
    (global as any).__internal_ClerkUICtor = vi.fn();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
    // Clean up globals
    delete (global as any).Clerk;
    delete (global as any).__internal_ClerkUICtor;
  });

  it('instantiates a IsomorphicClerk instance', () => {
    expect(() => {
      new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    }).not.toThrow();
  });

  it('updates props asynchronously after clerkjs has loaded', async () => {
    const propsHistory: any[] = [];
    const dummyClerkJS = {
      __internal_updateProps: (props: any) => propsHistory.push(props),
    };

    const isomorphicClerk = new IsomorphicClerk({ publishableKey: 'pk_test_XXX' });
    (isomorphicClerk as any).clerkjs = dummyClerkJS as any;

    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'dark' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'light' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'purple' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'yellow' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'red' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'blue' } });
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'green' } });
    expect(propsHistory).toEqual([]);

    vi.spyOn(isomorphicClerk, 'loaded', 'get').mockReturnValue(true);
    isomorphicClerk.emitLoaded();
    void isomorphicClerk.__internal_updateProps({ appearance: { theme: 'white' } });
    await vi.runAllTimersAsync();

    expect(propsHistory).toEqual([
      { appearance: { theme: 'dark' } },
      { appearance: { theme: 'light' } },
      { appearance: { theme: 'purple' } },
      { appearance: { theme: 'yellow' } },
      { appearance: { theme: 'red' } },
      { appearance: { theme: 'blue' } },
      { appearance: { theme: 'green' } },
      { appearance: { theme: 'white' } },
    ]);
  });

  it('handles multiple resource listeners', async () => {
    const listenerCallHistory: Array<Resources> = [];
    const addedListeners: Map<(payload: Resources) => void, { unsubscribe: UnsubscribeCallback }> = new Map();

    const dummyClerkJS = {
      addListener: (listener: (payload: Resources) => void) => {
        const unsubscribe = () => {
          addedListeners.delete(listener);
        };
        addedListeners.set(listener, { unsubscribe });
        return unsubscribe;
      },
    };

    const isomorphicClerk = new IsomorphicClerk({ publishableKey: 'pk_test_xxx' });
    (isomorphicClerk as any).clerkjs = dummyClerkJS as any;

    const unsubscribe1 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));
    const unsubscribe2 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));

    // Unsubscribe one listener before ClerkJS is loaded
    unsubscribe1();

    vi.spyOn(isomorphicClerk, 'loaded', 'get').mockReturnValue(true);
    isomorphicClerk.emitLoaded();
    const unsubscribe3 = isomorphicClerk.addListener(payload => listenerCallHistory.push(payload));

    // Simulate ClerkJS triggering the listeners
    const mockPayload = {
      user: { id: 'user_xxx' },
      session: { id: 'sess_xxx' },
      client: { id: 'client_xxx' },
      organization: undefined,
    } as Resources;
    addedListeners.forEach((_, listener) => listener(mockPayload));

    expect(listenerCallHistory).toEqual([mockPayload, mockPayload]);
    expect(listenerCallHistory.length).toBe(2);

    // Unsubscribe all remaining listeners
    unsubscribe2();
    unsubscribe3();
    listenerCallHistory.length = 0;
    addedListeners.forEach((_, listener) => listener(mockPayload));

    expect(listenerCallHistory).toEqual([]);
    expect(listenerCallHistory.length).toBe(0);
  });

  describe('bundled vs CDN UI loading', () => {
    const mockClerkUI = vi.fn();

    it('uses bundled UI when ui.ClerkUI is provided without __internal_preferCDN', async () => {
      const isomorphicClerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: {
          version: '1.0.0',
          ClerkUI: mockClerkUI as any,
        },
      });

      // Access the private method through any type cast
      const result = await (isomorphicClerk as any).getClerkUiEntryChunk();

      // Should return the bundled ClerkUI, not load from CDN
      expect(result).toBe(mockClerkUI);
      expect(mockLoadClerkUiScript).not.toHaveBeenCalled();
    });

    it('loads from CDN when ui.ClerkUI is provided WITH __internal_preferCDN: true', async () => {
      const isomorphicClerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: {
          version: '1.0.0',
          ClerkUI: mockClerkUI as any,
          __internal_preferCDN: true,
        },
      });

      // Access the private method through any type cast
      await (isomorphicClerk as any).getClerkUiEntryChunk();

      // Should load from CDN because __internal_preferCDN is true
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });

    it('loads from CDN when ui.ClerkUI is NOT provided', async () => {
      const isomorphicClerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: {
          version: '1.0.0',
        },
      });

      // Access the private method through any type cast
      await (isomorphicClerk as any).getClerkUiEntryChunk();

      // Should load from CDN because no bundled UI was provided
      expect(mockLoadClerkUiScript).toHaveBeenCalled();
    });

    it('loads from CDN with version pinning when ui.version is provided', async () => {
      const isomorphicClerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: {
          version: '2.0.0',
          __internal_preferCDN: true,
          ClerkUI: mockClerkUI as any,
        },
      });

      // Access the private method through any type cast
      await (isomorphicClerk as any).getClerkUiEntryChunk();

      // Should load from CDN with version pinning
      expect(mockLoadClerkUiScript).toHaveBeenCalledWith(
        expect.objectContaining({
          clerkUIVersion: '2.0.0',
        }),
      );
    });
  });
});
