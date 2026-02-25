import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    status: {
      isSupported: true,
      minimumVersion: null,
      updateURL: null,
    },
    addListener: vi.fn(callback => {
      callback();
      return vi.fn();
    }),
    refreshAppVersionSupportStatus: vi.fn(),
    subscribeAppVersionSupportStatus: vi.fn(() => vi.fn()),
    getAppVersionSupportStatus: vi.fn(() => mocks.status),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useClerk: () => ({
      addListener: mocks.addListener,
      __internal_environment: { nativeAppSettings: { minimumSupportedVersion: { ios: [], android: [] } } },
    }),
  };
});

vi.mock('../../app-version-support/status-store', () => {
  return {
    refreshAppVersionSupportStatus: mocks.refreshAppVersionSupportStatus,
    subscribeAppVersionSupportStatus: mocks.subscribeAppVersionSupportStatus,
    getAppVersionSupportStatus: mocks.getAppVersionSupportStatus,
  };
});

import { useAppVersionSupportStatus } from '../useAppVersionSupportStatus';

describe('useAppVersionSupportStatus', () => {
  test('subscribes to app-version-support status and refreshes from environment', () => {
    const { result } = renderHook(() => useAppVersionSupportStatus());

    expect(result.current).toEqual(mocks.status);
    expect(mocks.refreshAppVersionSupportStatus).toHaveBeenCalled();
    expect(mocks.addListener).toHaveBeenCalled();
    expect(mocks.subscribeAppVersionSupportStatus).toHaveBeenCalled();
  });
});
