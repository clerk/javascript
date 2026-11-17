import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useAuth } from '../useAuth';

const mocks = vi.hoisted(() => {
  return {
    getTokenBase: vi.fn(),
  };
});

vi.mock('@clerk/react', () => {
  return {
    useAuth: () => ({ isLoaded: true, isSignedIn: true, getToken: mocks.getTokenBase }),
  };
});

describe('useAuth', () => {
  test('returns the same getToken across renders', () => {
    const { result, rerender } = renderHook(() => useAuth());
    const firstGetToken = result.current.getToken;

    rerender();

    expect(result.current.getToken).toBe(firstGetToken);
  });
});
