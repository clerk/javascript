import { loadClerkJSScript, loadClerkUIScript } from '@clerk/shared/loadClerkJsScript';
import type { Resources, UnsubscribeCallback } from '@clerk/shared/types';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { IsomorphicClerk } from '../isomorphicClerk';

// Mock the script loading functions to prevent unhandled promise rejections in tests
vi.mock('@clerk/shared/loadClerkJsScript', () => ({
  loadClerkJSScript: vi.fn().mockResolvedValue(null),
  loadClerkUIScript: vi.fn().mockResolvedValue(null),
}));

describe('isomorphicClerk', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    // Set up minimal global Clerk objects to prevent errors during initialization
    (global as any).Clerk = {
      load: vi.fn().mockResolvedValue(undefined),
      loaded: false,
    };
    (global as any).__internal_ClerkUICtor = vi.fn();
  });

  afterEach(() => {
    vi.mocked(loadClerkJSScript).mockClear();
    vi.mocked(loadClerkUIScript).mockClear();
    // Clean up globals
    delete (global as any).Clerk;
    delete (global as any).__internal_ClerkUICtor;
  });

  afterAll(() => {
    vi.useRealTimers();
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

  describe('__internal_* URL precedence', () => {
    it('__internal_clerkJSUrl causes script loading even when Clerk prop is provided', async () => {
      const mockClerkCtor = vi.fn().mockImplementation(() => ({
        load: vi.fn().mockResolvedValue(undefined),
        loaded: false,
      }));
      // Make the mock pass the isConstructor check
      mockClerkCtor.prototype = {};

      const clerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        Clerk: mockClerkCtor as any,
        __internal_clerkJSUrl: 'https://staging.clerk.com/clerk.js',
      });

      // Trigger loading by accessing the private method
      await (clerk as any).getClerkJsEntryChunk();

      // Should load from URL, not use the bundled constructor
      expect(loadClerkJSScript).toHaveBeenCalled();
      expect(mockClerkCtor).not.toHaveBeenCalled();
    });

    it('__internal_clerkUIUrl causes script loading even when ui.ClerkUI prop is provided', async () => {
      const mockClerkUI = vi.fn();

      const clerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: { ClerkUI: mockClerkUI } as any,
        __internal_clerkUIUrl: 'https://staging.clerk.com/clerk-ui.js',
      });

      const result = await (clerk as any).getClerkUIEntryChunk();

      // Should load from URL, not return the bundled ClerkUI
      expect(loadClerkUIScript).toHaveBeenCalled();
      expect(result).not.toBe(mockClerkUI);
    });

    it('Clerk prop is used when no __internal_clerkJSUrl is set', async () => {
      const mockInstance = {
        load: vi.fn().mockResolvedValue(undefined),
        loaded: false,
      };
      const mockClerkCtor = vi.fn().mockImplementation(() => mockInstance);
      mockClerkCtor.prototype = {};

      const clerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        Clerk: mockClerkCtor as any,
      });

      await (clerk as any).getClerkJsEntryChunk();

      // Should use the bundled constructor, not load from URL
      expect(loadClerkJSScript).not.toHaveBeenCalled();
      expect(mockClerkCtor).toHaveBeenCalled();
    });

    it('ui.ClerkUI is used when no __internal_clerkUIUrl is set', async () => {
      const mockClerkUI = vi.fn();

      const clerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ui: { ClerkUI: mockClerkUI } as any,
      });

      const result = await (clerk as any).getClerkUIEntryChunk();

      // Should return the bundled ClerkUI, not load from URL
      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(result).toBe(mockClerkUI);
    });
  });
});
