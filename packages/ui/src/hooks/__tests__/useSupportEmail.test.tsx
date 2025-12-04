import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { useSupportEmail } from '../useSupportEmail';

const mockUseOptions = vi.fn();
const mockUseEnvironment = vi.fn();

vi.mock('@clerk/shared/react', () => ({
  useClerk: () => ({
    publishableKey: 'pk_live_Y2xlcmsuY2xlcmsuY29tJA',
  }),
}));
vi.mock('../../contexts', () => {
  return {
    useEnvironment: () => mockUseEnvironment(),
    useOptions: () => mockUseOptions(),
  };
});

describe('useSupportEmail', () => {
  test('should use custom email when provided from options', () => {
    mockUseOptions.mockImplementationOnce(() => ({ supportEmail: 'test@email.com' }));
    mockUseEnvironment.mockImplementationOnce(() => ({ displayConfig: { supportEmail: null } }));
    const { result } = renderHook(() => useSupportEmail());

    expect(result.current).toBe('test@email.com');
  });

  test('should use custom email when provided from the environment', () => {
    mockUseOptions.mockImplementationOnce(() => ({}));
    mockUseEnvironment.mockImplementationOnce(() => ({ displayConfig: { supportEmail: 'test@email.com' } }));
    const { result } = renderHook(() => useSupportEmail());

    expect(result.current).toBe('test@email.com');
  });

  test('should fallback to default when supportEmail is not provided in options or the environment', () => {
    mockUseOptions.mockImplementationOnce(() => ({}));
    mockUseEnvironment.mockImplementationOnce(() => ({ displayConfig: { supportEmail: null } }));
    const { result } = renderHook(() => useSupportEmail());

    expect(result.current).toBe('support@clerk.com');
  });
});
