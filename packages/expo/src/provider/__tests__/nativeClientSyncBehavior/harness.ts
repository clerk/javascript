import type { FakePersistentTokenCache } from './environment';
import type { FakeClerk } from './fakeClerk';
import type { FakeNativeClerk } from './fakeNativeClerk';
import type { FakeClerkServer } from './fakeServer';

export type NativeSyncScenario = {
  server?: FakeClerkServer;
  /**
   * Device token in an app-provided persistent token cache. When omitted (and `persistentTokenCache`
   * is not set), ClerkProvider runs with its default in-memory token cache.
   */
  jsDeviceToken?: string | null;
  persistentTokenCache?: boolean;
  nativeDeviceToken?: string | null;
  nativeModule?: 'present' | 'absent';
  disableNativeClientSync?: boolean;
  delayNativeStartup?: boolean;
};

/**
 * Engine-agnostic handle on a rendered ClerkProvider wired to a fake Frontend API, a fake native SDK,
 * and a clerk-js stand-in. Behavior tests only talk to this; engine specifics stay in the adapter.
 */
export type NativeSyncHarness = {
  server: FakeClerkServer;
  native: FakeNativeClerk;
  js: FakeClerk;
  persistentTokenCache: FakePersistentTokenCache | null;
  jsDeviceToken: () => Promise<string | null>;
  nativeModuleCalls: string[];
  run: <T>(action: () => T | Promise<T>) => Promise<T>;
  settle: () => Promise<void>;
  releaseNativeStartup: () => void;
  unmount: () => void;
};

export type RenderWithNativeSync = (scenario?: NativeSyncScenario) => Promise<NativeSyncHarness>;
