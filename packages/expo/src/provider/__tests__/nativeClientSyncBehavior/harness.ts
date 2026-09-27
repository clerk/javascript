import type { FakePersistentTokenCache } from './environment';
import type { FakeClerk } from './fakeClerk';
import type { FakeNativeClerk } from './fakeNativeClerk';
import type { FakeClerkServer } from './fakeServer';

export type NativeSyncScenario = {
  /** Shared Frontend API; seed it before rendering to start from existing clients. */
  server?: FakeClerkServer;
  /**
   * Device token in an app-provided persistent token cache. When omitted (and `persistentTokenCache`
   * is not set), ClerkProvider runs with its default in-memory token cache.
   */
  jsDeviceToken?: string | null;
  persistentTokenCache?: boolean;
  /** Device token the native SDK has persisted from a previous launch. */
  nativeDeviceToken?: string | null;
  nativeModule?: 'present' | 'absent';
  disableNativeClientSync?: boolean;
  /** Keep the native SDK in its startup phase until `releaseNativeStartup` is called. */
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
  /** The app-provided persistent token cache, when the scenario uses one. */
  persistentTokenCache: FakePersistentTokenCache | null;
  /** The device token the next JS Frontend API request authenticates with. */
  jsDeviceToken: () => Promise<string | null>;
  /** Names of native module methods the engine has called. */
  nativeModuleCalls: string[];
  /** Runs a world action (JS or native) inside `act`. */
  run: <T>(action: () => T | Promise<T>) => Promise<T>;
  /** Lets in-flight requests, notifications, and renders drain. */
  settle: () => Promise<void>;
  /** What biometric flows do before a native operation: wait until native reflects JS. */
  awaitJsToNativeSync: () => Promise<void>;
  /** What biometric flows do after a native operation: bring JS up to date with native. */
  pullNativeToJs: () => Promise<void>;
  releaseNativeStartup: () => void;
  unmount: () => void;
};

export type RenderWithNativeSync = (scenario?: NativeSyncScenario) => Promise<NativeSyncHarness>;
