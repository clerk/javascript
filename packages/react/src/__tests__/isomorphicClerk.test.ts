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

  describe('shouldLoadUi across SDK scenarios', () => {
    // Helper to run getEntryChunks and return what clerk.load was called with
    async function runGetEntryChunks(options: Record<string, any>) {
      const mockLoad = vi.fn().mockResolvedValue(undefined);
      const mockClerkInstance = options.Clerk || {
        load: mockLoad,
        loaded: false,
      };
      if (options.Clerk) {
        options.Clerk.load = mockLoad;
        options.Clerk.loaded = false;
      }

      (global as any).Clerk = mockClerkInstance;

      const clerk = new IsomorphicClerk({
        publishableKey: 'pk_test_XXX',
        ...options,
      });

      await (clerk as any).getEntryChunks();

      return { mockLoad };
    }

    // ─── @clerk/react, @clerk/nextjs, @clerk/react-router, @clerk/tanstack-react-start ───
    // These SDKs: no Clerk prop, no ui prop, standardBrowser omitted (undefined)
    // shouldLoadUi = (undefined !== false && !undefined) || !!undefined = (true && true) || false = true
    // → loads UI from CDN
    it('loads UI from CDN when no Clerk, no ui, standardBrowser omitted (nextjs/react-router/tanstack)', async () => {
      const { mockLoad } = await runGetEntryChunks({});

      expect(loadClerkUIScript).toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: (global as any).__internal_ClerkUICtor,
          }),
        }),
      );
    });

    // ─── @clerk/react with bundled ui prop (e.g. user passes ui={ui} from @clerk/ui) ───
    // These SDKs: no Clerk prop, ui with ClerkUI, standardBrowser omitted
    // shouldLoadUi = (true && true) || true = true
    // → getClerkUIEntryChunk returns the bundled ClerkUI (no CDN)
    it('uses bundled ClerkUI when ui prop is passed without Clerk instance (react with ui prop)', async () => {
      const mockClerkUI = vi.fn();
      const { mockLoad } = await runGetEntryChunks({
        ui: { ClerkUI: mockClerkUI },
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: mockClerkUI,
          }),
        }),
      );
    });

    // ─── @clerk/expo (native mode) ───
    // Expo native: Clerk instance, no ui prop, standardBrowser: false
    // shouldLoadUi = (false !== false && ...) || !!undefined = false || false = false
    // → no UI loaded (correct: native apps don't render prebuilt UI)
    it('does not load UI for Expo native (Clerk instance, no ui, standardBrowser: false)', async () => {
      const mockClerkInstance = {} as any;
      const { mockLoad } = await runGetEntryChunks({
        Clerk: mockClerkInstance,
        standardBrowser: false,
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: undefined,
          }),
        }),
      );
    });

    // ─── @clerk/expo (web mode) ───
    // Expo web: Clerk is null, no ui prop, standardBrowser: true
    // shouldLoadUi = (true !== false && !null) || false = (true && true) || false = true
    // → loads UI from CDN (correct: web mode uses normal browser flow)
    it('loads UI from CDN for Expo web (Clerk: null, standardBrowser: true)', async () => {
      const { mockLoad } = await runGetEntryChunks({
        Clerk: null,
        standardBrowser: true,
      });

      expect(loadClerkUIScript).toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: (global as any).__internal_ClerkUICtor,
          }),
        }),
      );
    });

    // ─── @clerk/chrome-extension (without syncHost) ───
    // No syncHost: Clerk instance, ui with ClerkUI, standardBrowser: true
    // shouldLoadUi = (true && !instance) || true = false || true = true
    // → uses bundled ClerkUI (no CDN)
    it('uses bundled ClerkUI for chrome-extension without syncHost (standardBrowser: true)', async () => {
      const mockClerkUI = vi.fn();
      const mockClerkInstance = {} as any;
      const { mockLoad } = await runGetEntryChunks({
        Clerk: mockClerkInstance,
        ui: { ClerkUI: mockClerkUI },
        standardBrowser: true,
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: mockClerkUI,
          }),
        }),
      );
    });

    // ─── @clerk/chrome-extension (with syncHost) ───
    // With syncHost: Clerk instance, ui with ClerkUI, standardBrowser: false
    // shouldLoadUi = (false !== false && ...) || !!ClerkUI = false || true = true
    // → uses bundled ClerkUI (no CDN)
    it('uses bundled ClerkUI for chrome-extension with syncHost (standardBrowser: false)', async () => {
      const mockClerkUI = vi.fn();
      const mockClerkInstance = {} as any;
      const { mockLoad } = await runGetEntryChunks({
        Clerk: mockClerkInstance,
        ui: { ClerkUI: mockClerkUI },
        standardBrowser: false,
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: mockClerkUI,
          }),
        }),
      );
    });

    // ─── Clerk instance provided, no ui prop, standardBrowser: true ───
    // shouldLoadUi = (true && !instance) || false = false || false = false
    // → no UI loaded (correct: Clerk instance without bundled UI, no CDN attempt)
    it('does not load UI when Clerk instance provided without ui prop (standardBrowser: true)', async () => {
      const mockClerkInstance = {} as any;
      const { mockLoad } = await runGetEntryChunks({
        Clerk: mockClerkInstance,
        standardBrowser: true,
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: undefined,
          }),
        }),
      );
    });

    // ─── ui prop passed as server marker (no ClerkUI), no Clerk instance ───
    // RSC react-server export may provide ui without ClerkUI initially
    // shouldLoadUi = (true && true) || false = true
    // → getClerkUIEntryChunk is called, but uiProp exists without ClerkUI → returns undefined (skips CDN)
    it('skips CDN when ui prop exists without ClerkUI (server marker object)', async () => {
      const { mockLoad } = await runGetEntryChunks({
        ui: { __brand: '__clerkUI', version: '1.0.0' },
      });

      expect(loadClerkUIScript).not.toHaveBeenCalled();
      expect(mockLoad).toHaveBeenCalledWith(
        expect.objectContaining({
          ui: expect.objectContaining({
            ClerkUI: undefined,
          }),
        }),
      );
    });
  });
});
