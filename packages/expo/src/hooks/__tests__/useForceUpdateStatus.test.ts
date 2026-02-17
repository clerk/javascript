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
    refreshForceUpdateStatus: vi.fn(),
    subscribeForceUpdateStatus: vi.fn(() => vi.fn()),
    getForceUpdateStatus: vi.fn(() => mocks.status),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useClerk: () => ({
      addListener: mocks.addListener,
      __internal_environment: { forceUpdate: { ios: [], android: [] } },
    }),
  };
});

vi.mock('../../force-update/status-store', () => {
  return {
    refreshForceUpdateStatus: mocks.refreshForceUpdateStatus,
    subscribeForceUpdateStatus: mocks.subscribeForceUpdateStatus,
    getForceUpdateStatus: mocks.getForceUpdateStatus,
  };
});

import { useForceUpdateStatus } from '../useForceUpdateStatus';

describe('useForceUpdateStatus', () => {
  test('subscribes to force-update status and refreshes from environment', () => {
    const { result } = renderHook(() => useForceUpdateStatus());

    expect(result.current).toEqual(mocks.status);
    expect(mocks.refreshForceUpdateStatus).toHaveBeenCalled();
    expect(mocks.addListener).toHaveBeenCalled();
    expect(mocks.subscribeForceUpdateStatus).toHaveBeenCalled();
  });
});
