import { useAuth } from '@clerk/react';
import { createClerkEventBus } from '@clerk/shared/clerkEventBus';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';

import {
  applySupportedAppVersion,
  applyUnsupportedAppVersion,
  nextAppVersionRequest,
} from '../../app-version/appVersionSupport';
import { ClerkProvider } from '../ClerkProvider';

const { failingClerk } = vi.hoisted(() => ({ failingClerk: { current: null as unknown } }));

vi.mock('../../polyfills', () => ({}));

vi.mock('expo-secure-store', () => ({
  AFTER_FIRST_UNLOCK: 0,
  deleteItemAsync: vi.fn(),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}));

vi.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'ios', constants: { reactNativeVersion: { major: 0, minor: 81, patch: 0 } } },
  AppState: { addEventListener: () => ({ remove: () => {} }) },
}));

vi.mock('../../utils/runtime', () => ({
  isExpoGo: () => false,
  isNative: () => true,
  isWeb: () => false,
}));

vi.mock('../../utils/native-module', () => ({ ClerkExpoModule: null }));

vi.mock('../../update-required/UpdateRequiredModal', () => ({ UpdateRequiredModal: () => null }));

vi.mock('../../app-version/nativeAppIdentity', () => ({
  getNativeAppIdentity: () => ({
    platform: 'ios',
    appIdentifier: 'com.example.app',
    version: '1.0',
    displayVersion: '1.0',
  }),
  getNativeAppPlatform: () => 'ios',
  isExpoApplicationInstalled: () => true,
}));

vi.mock('../singleton', () => ({ getClerkInstance: () => failingClerk.current }));

function createFailingClerk() {
  const eventBus = createClerkEventBus();
  let status = 'loading';
  eventBus.prioritizedOn('status', next => (status = next));
  const resources = { client: { signedInSessions: [] }, session: null, user: null, organization: null };
  return {
    publishableKey: 'pk_test_Y2xlcmsuZXhhbXBsZS5jb20k',
    get loaded() {
      return status === 'ready' || status === 'degraded';
    },
    get status() {
      return status;
    },
    load: vi.fn(() => {
      eventBus.emit('status', 'error');
      return Promise.reject(new Error('Unsupported app version'));
    }),
    on: eventBus.on,
    off: eventBus.off,
    addListener: (listener: (resources: unknown) => void) => {
      listener(resources);
      return () => {};
    },
    finishLoad: () => eventBus.emit('status', 'ready'),
    __internal_lastEmittedResources: resources,
    ...resources,
  };
}

function Counter() {
  const [count, setCount] = useState(0);
  const { isLoaded } = useAuth();
  return (
    <button
      type='button'
      onClick={() => setCount(value => value + 1)}
    >
      {count} {isLoaded ? 'loaded' : 'not loaded'}
    </button>
  );
}

describe('ClerkProvider after Clerk fails to load while the app version is unsupported', () => {
  test('finishes loading without remounting the app', async () => {
    const clerk = createFailingClerk();
    failingClerk.current = clerk;
    act(() => applyUnsupportedAppVersion({ minimum_version: '2.0' }, nextAppVersionRequest()));

    render(
      <ClerkProvider publishableKey={clerk.publishableKey}>
        <Counter />
      </ClerkProvider>,
    );
    // The failed load settles asynchronously.
    await act(() => Promise.resolve());
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button').textContent).toBe('1 not loaded');

    act(() => applySupportedAppVersion(nextAppVersionRequest()));
    // React replays its queued calls on a microtask after the finished load.
    await act(() => {
      clerk.finishLoad();
      return Promise.resolve();
    });

    expect(screen.getByRole('button').textContent).toBe('1 loaded');
    expect(clerk.load).toHaveBeenCalledTimes(1);
  });
});
